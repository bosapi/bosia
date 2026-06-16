import { render } from "svelte/server";

import { findMatch } from "./matcher.ts";
import { serverRoutes, errorPage } from "bosia:routes";
import type { RouteMatch } from "./types.ts";
import type { Cookies, LoaderDeps } from "./hooks.ts";
import { CSP_ENABLED } from "./csp.ts";
import {
	CACHE_ENABLED,
	buildCompressedVariants,
	cacheGet,
	cacheSet,
	collectTags,
	computeCacheKey,
	concatChunks,
	serveCached,
} from "./cache.ts";
import { HttpError, Redirect } from "./errors.ts";
import { pickErrorPage, type ErrorOrigin } from "./errorMatch.ts";
import App from "./client/App.svelte";
import {
	buildHtml,
	buildHtmlShellOpen,
	buildMetadataChunk,
	buildHtmlTail,
	compress,
	isDev,
} from "./html.ts";
import type { Metadata } from "./hooks.ts";
import { loadPlugins } from "./config.ts";
import { reportDevErrorFromCatch } from "./devErrorReport.ts";
import { dev500Response } from "./dev-500.ts";
import type { BosiaPlugin, RenderContext } from "./types/plugin.ts";
import { getAppHtmlSegments } from "./appHtml.ts";
import type { AppHtmlSegments } from "./appHtml.ts";

// Plugins are loaded once per process at module init via top-level await elsewhere
// (server.ts), but renderer is also reachable from build/prerender contexts where
// loadPlugins() may not have been called yet. The function is cached, so awaiting
// per request is cheap (Map hit on second call).
async function pluginRenderFragments(
	hook: "head" | "bodyEnd",
	ctx: RenderContext,
): Promise<string[]> {
	const plugins = await loadPlugins();
	const out: string[] = [];
	for (const p of plugins as BosiaPlugin[]) {
		const fn = p.render?.[hook];
		if (!fn) continue;
		try {
			const fragment = await fn(ctx);
			if (fragment) out.push(fragment);
		} catch (err) {
			if (isDev) console.error(`Plugin "${p.name}" render.${hook} failed:`, err);
			else console.error(`Plugin "${p.name}" render.${hook} failed:`, (err as Error).message);
			if (isDev) reportDevErrorFromCatch(err);
		}
	}
	return out;
}

// ─── Timeout Helpers ─────────────────────────────────────

class LoadTimeoutError extends Error {
	constructor(label: string, ms: number) {
		super(`${label} timed out after ${ms}ms`);
		this.name = "LoadTimeoutError";
	}
}

function parseTimeout(raw: string | undefined, fallback: number): number {
	if (!raw || raw === "Infinity") return 0;
	const n = parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
}

const LOAD_TIMEOUT = parseTimeout(process.env.LOAD_TIMEOUT, 5000);
const METADATA_TIMEOUT = parseTimeout(process.env.METADATA_TIMEOUT, 3000);

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
	if (ms <= 0) return promise;
	let timer: Timer;
	return Promise.race([
		promise.finally(() => clearTimeout(timer)),
		new Promise<never>(
			(_, reject) => (timer = setTimeout(() => reject(new LoadTimeoutError(label, ms)), ms)),
		),
	]);
}

// ─── Internal-Host Allowlist ─────────────────────────────
// Origins that share the user's session cookie. Cookie is auto-forwarded
// to same-origin requests AND to any origin in this set. Anything else
// (third-party APIs) gets no Cookie header by default.

const INTERNAL_HOSTS: Set<string> = (() => {
	const raw =
		process.env.INTERNAL_HOSTS?.split(",")
			.map((s) => s.trim())
			.filter(Boolean) ?? [];
	const valid = new Set<string>();
	for (const entry of raw) {
		try {
			valid.add(new URL(entry).origin);
		} catch {
			console.warn(`⚠️  INTERNAL_HOSTS: ignoring invalid origin "${entry}"`);
		}
	}
	return valid;
})();

if (INTERNAL_HOSTS.size > 0) {
	console.log(`🍪 Internal hosts (cookies forwarded): ${[...INTERNAL_HOSTS].join(", ")}`);
}

// ─── App HTML Template ───────────────────────────────────
// Required; loaded once per process; cached singleton with invalidation for HMR

const appHtmlSegments: AppHtmlSegments = getAppHtmlSegments();

// ─── Session-Aware Fetch ─────────────────────────────────
// Passed to load() functions so they can call internal APIs with the
// current user's cookies automatically forwarded. Cookie is attached
// only on same-origin requests or to origins in INTERNAL_HOSTS — never
// to arbitrary third-party hosts (which would leak the session token).

function makeFetch(req: Request, url: URL) {
	const cookie = req.headers.get("cookie") ?? "";
	const sameOrigin = url.origin;

	return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		let targetOrigin: string | null = null;
		let resolved: RequestInfo | URL = input;

		try {
			if (typeof input === "string") {
				const parsed = new URL(input, sameOrigin);
				targetOrigin = parsed.origin;
				resolved = parsed.href;
			} else if (input instanceof URL) {
				targetOrigin = input.origin;
			} else {
				targetOrigin = new URL(input.url).origin;
			}
		} catch {
			targetOrigin = null;
		}

		const headers = new Headers(init?.headers);
		const trusted =
			targetOrigin !== null && (targetOrigin === sameOrigin || INTERNAL_HOSTS.has(targetOrigin));
		if (cookie && trusted && !headers.has("cookie")) headers.set("cookie", cookie);

		return globalThis.fetch(resolved, { ...init, headers });
	};
}

// ─── Error Context Stamping ──────────────────────────────
// Annotate an HttpError with the layout depth and origin where it was
// thrown, plus the partial layoutData accumulated so far. The data
// endpoint forwards this to the client; the SSR catch sites use it to
// render the right nested boundary inside the right layout chain.

function stampErrorContext(
	err: HttpError,
	depth: number,
	origin: ErrorOrigin,
	partialLayoutData: Record<string, any>[],
): void {
	const e = err as HttpError & {
		errorDepth?: number;
		errorOrigin?: ErrorOrigin;
		partialLayoutData?: Record<string, any>[];
	};
	e.errorDepth ??= depth;
	e.errorOrigin ??= origin;
	e.partialLayoutData ??= [...partialLayoutData];
}

// ─── Per-Loader Dependency Tracking ──────────────────────
// Wraps `params`, `url`, `cookies`, and `fetch` with proxies/closures
// that record every key read during a single loader run. The client
// cache uses these records to skip re-runs on subsequent navigations
// when none of the tracked inputs changed.

function emptyDeps(): LoaderDeps {
	return {
		keys: [],
		urls: [],
		params: [],
		searchParams: [],
		cookies: [],
		uses_url: false,
	};
}

function trackedParams(params: Record<string, string>, deps: LoaderDeps): Record<string, string> {
	return new Proxy(params, {
		get(target, prop) {
			if (typeof prop === "string") {
				if (!deps.params.includes(prop)) deps.params.push(prop);
			}
			return Reflect.get(target, prop);
		},
	});
}

const URL_TRACKED_PROPS = new Set(["pathname", "origin", "hash", "href", "host", "hostname"]);

function trackedUrl(url: URL, deps: LoaderDeps): URL {
	const trackedSearch = new Proxy(url.searchParams, {
		get(target, prop) {
			if (prop === "get" || prop === "has" || prop === "getAll") {
				return (key: string) => {
					if (typeof key === "string" && !deps.searchParams.includes(key)) {
						deps.searchParams.push(key);
					}
					return (target as any)[prop](key);
				};
			}
			const value = Reflect.get(target, prop);
			return typeof value === "function" ? value.bind(target) : value;
		},
	});
	return new Proxy(url, {
		get(target, prop) {
			if (prop === "searchParams") return trackedSearch;
			if (prop === "search") {
				// Whole search string read → treat as broad searchParams dep
				deps.uses_url = true;
				return target.search;
			}
			if (typeof prop === "string" && URL_TRACKED_PROPS.has(prop)) {
				deps.uses_url = true;
			}
			const value = Reflect.get(target, prop);
			return typeof value === "function" ? value.bind(target) : value;
		},
	});
}

function trackedCookies(cookies: Cookies, deps: LoaderDeps): Cookies {
	return {
		get(name: string) {
			if (!deps.cookies.includes(name)) deps.cookies.push(name);
			return cookies.get(name);
		},
		getAll() {
			// Broad read — treat as wildcard; record empty marker so any cookie
			// invalidation triggers re-run. Use a sentinel "*" to mean "all".
			if (!deps.cookies.includes("*")) deps.cookies.push("*");
			return cookies.getAll();
		},
		set(name, value, options) {
			cookies.set(name, value, options);
		},
		delete(name, options) {
			cookies.delete(name, options);
		},
	};
}

function trackedFetch(
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	origin: string,
	deps: LoaderDeps,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
	return (input, init) => {
		let href: string | null = null;
		try {
			if (typeof input === "string") href = new URL(input, origin).href;
			else if (input instanceof URL) href = input.href;
			else href = new URL(input.url, origin).href;
		} catch {
			href = null;
		}
		if (href && !deps.urls.includes(href)) deps.urls.push(href);
		return fetch(input, init);
	};
}

function makeDepends(deps: LoaderDeps): (...keys: string[]) => void {
	return (...keys: string[]) => {
		for (const k of keys) {
			if (typeof k === "string" && !deps.keys.includes(k)) deps.keys.push(k);
		}
	};
}

// ─── Route Data Loader ───────────────────────────────────
// Runs layout + page server loaders for a given URL.
// Used by both SSR and the /__bosia/data JSON endpoint.
//
// `mask` controls selective re-runs from the client data endpoint:
//   - undefined → run everything (SSR, first nav)
//   - layouts[i] === true → run that layout; false → skip, emit null
//   - page === true → run page; false → skip, emit null
// When skipped, the parent() chain still receives the *combined parent
// data* contributed by previously-cached layers. The client already holds
// each skipped layer's data in its loader cache and forwards it as
// `parentSnapshots` (depth → data) in the request body, so downstream
// loaders that DO re-run see real parent() data, not `{}`. The response
// slot stays `null` (client renders that layer from its cache).
//
// Trust boundary: parentSnapshots are a client-supplied perf hint, never
// authoritative. Anything authz-related must read `event.locals` (populated
// in hooks.server.ts), never `parent()`.

export type LoaderMask = {
	page: boolean;
	layouts: boolean[];
};

export async function loadRouteData(
	url: URL,
	locals: Record<string, any>,
	req: Request,
	cookies: Cookies,
	metadataData: Record<string, any> | null = null,
	match?: RouteMatch<(typeof serverRoutes)[number]> | null,
	mask?: LoaderMask,
	parentSnapshots?: Record<number, Record<string, any>>,
) {
	match ??= findMatch(serverRoutes, url.pathname);
	if (!match) return null;

	const { route, params } = match;
	const fetch = makeFetch(req, url);
	const origin = url.origin;
	const layoutData: (Record<string, any> | null)[] = [];
	const layoutDeps: (LoaderDeps | null)[] = [];
	let parentData: Record<string, any> = {};

	// Run layout server loaders root → leaf, each gets parent() data
	for (const ls of route.layoutServers) {
		const skip = mask && mask.layouts[ls.depth] === false;
		try {
			if (skip) {
				layoutData[ls.depth] = null;
				layoutDeps[ls.depth] = null;
				// Skipped layers contribute their client-cached data (forwarded as
				// parentSnapshots) to the parent chain, so downstream loaders that DO
				// re-run see real parent() data. Falls back to {} when no snapshot was
				// sent. Perf hint only — never authoritative for authz (use locals).
				parentData = { ...parentData, ...(parentSnapshots?.[ls.depth] ?? {}) };
				continue;
			}
			const mod = await ls.loader();
			if (typeof mod.load === "function") {
				// Snapshot per layer so loaders cannot mutate the shared accumulator,
				// preserving the same isolation semantics as the previous merge-on-call code.
				const snapshot = { ...parentData };
				const parent = async () => snapshot;
				const deps = emptyDeps();
				const result =
					(await withTimeout(
						mod.load({
							params: trackedParams(params, deps),
							url: trackedUrl(url, deps),
							locals,
							cookies: trackedCookies(cookies, deps),
							parent,
							fetch: trackedFetch(fetch, origin, deps),
							metadata: null,
							depends: makeDepends(deps),
						}),
						LOAD_TIMEOUT,
						`layout load (depth=${ls.depth}, ${url.pathname})`,
					)) ?? {};
				layoutData[ls.depth] = result;
				layoutDeps[ls.depth] = deps;
				parentData = { ...parentData, ...result };
			} else {
				layoutData[ls.depth] = {};
				layoutDeps[ls.depth] = emptyDeps();
			}
		} catch (err) {
			if (err instanceof Redirect) throw err;
			if (err instanceof HttpError) {
				stampErrorContext(
					err,
					ls.depth,
					"layout",
					layoutData.map((d) => d ?? {}),
				);
				throw err;
			}
			if (isDev) console.error("Layout server load error:", err);
			else console.error("Layout server load error:", (err as Error).message ?? err);
			if (isDev) reportDevErrorFromCatch(err);
			const wrapped = new HttpError(500, "Internal Server Error");
			stampErrorContext(
				wrapped,
				ls.depth,
				"layout",
				layoutData.map((d) => d ?? {}),
			);
			throw wrapped;
		}
	}

	// Run page server loader
	let pageData: Record<string, any> | null = null;
	let pageDeps: LoaderDeps | null = null;
	let csr = true;
	let ssr = true;
	const skipPage = mask && mask.page === false;
	if (route.pageServer) {
		try {
			const mod = await route.pageServer();
			if (mod.csr === false) csr = false;
			if (mod.ssr === false) ssr = false;
			if (skipPage) {
				pageData = null;
				pageDeps = null;
			} else if (typeof mod.load === "function") {
				const snapshot = { ...parentData };
				const parent = async () => snapshot;
				const deps = emptyDeps();
				pageData =
					(await withTimeout(
						mod.load({
							params: trackedParams(params, deps),
							url: trackedUrl(url, deps),
							locals,
							cookies: trackedCookies(cookies, deps),
							parent,
							fetch: trackedFetch(fetch, origin, deps),
							metadata: metadataData,
							depends: makeDepends(deps),
						}),
						LOAD_TIMEOUT,
						`page load (${url.pathname})`,
					)) ?? {};
				pageDeps = deps;
			} else {
				pageData = {};
				pageDeps = emptyDeps();
			}
		} catch (err) {
			if (err instanceof Redirect) throw err;
			if (err instanceof HttpError) {
				stampErrorContext(
					err,
					route.layoutModules.length,
					"page",
					layoutData.map((d) => d ?? {}),
				);
				throw err;
			}
			if (isDev) console.error("Page server load error:", err);
			else console.error("Page server load error:", (err as Error).message ?? err);
			if (isDev) reportDevErrorFromCatch(err);
			const wrapped = new HttpError(500, "Internal Server Error");
			stampErrorContext(
				wrapped,
				route.layoutModules.length,
				"page",
				layoutData.map((d) => d ?? {}),
			);
			throw wrapped;
		}
	} else {
		pageData = {};
		pageDeps = emptyDeps();
	}

	// `params` are always attached to pageData for client-side router consumption.
	// When pageData is skipped, the client merges its cached pageData with current
	// route params separately, so we keep the `null` sentinel here.
	const pageOut = pageData === null ? null : { ...pageData, params };
	return { pageData: pageOut, layoutData, csr, ssr, pageDeps, layoutDeps };
}

// ─── Metadata Loader ─────────────────────────────────────

export async function loadMetadata(
	route: any,
	params: Record<string, string>,
	url: URL,
	locals: Record<string, any>,
	cookies: Cookies,
	req: Request,
): Promise<Metadata | null> {
	if (!route.pageServer) return null;
	try {
		const mod = await route.pageServer();
		if (typeof mod.metadata === "function") {
			const fetch = makeFetch(req, url);
			return (
				(await withTimeout(
					mod.metadata({ params, url, locals, cookies, fetch }),
					METADATA_TIMEOUT,
					`metadata (${url.pathname})`,
				)) ?? null
			);
		}
	} catch (err) {
		if (isDev) console.error("Metadata load error:", err);
		else console.error("Metadata load error:", (err as Error).message ?? err);
		if (isDev) reportDevErrorFromCatch(err);
	}
	return null;
}

// ─── Streaming SSR Renderer ──────────────────────────────

export async function renderSSRStream(
	url: URL,
	locals: Record<string, any>,
	req: Request,
	cookies: Cookies,
	match?: RouteMatch<(typeof serverRoutes)[number]> | null,
): Promise<Response | null> {
	match ??= findMatch(serverRoutes, url.pathname);
	if (!match) return null;

	const { route, params } = match;
	const nonce = CSP_ENABLED && typeof locals.nonce === "string" ? locals.nonce : undefined;

	// ── Response cache: short-circuit on hit ──
	// Look up cached HTML before doing anything expensive (metadata, load,
	// render, compress). Key includes URL + identity hash (cookies/headers
	// from CACHE_KEYS), so per-user pages stay isolated. Routes opt out via
	// `export const cache = false`. See cache.ts and docs/guides/response-cache.md.
	const pageMod: any = await route.pageModule();
	const cacheBypass = url.searchParams.has("_invalidated");
	// CSP is incompatible with response cache — the per-request nonce is baked
	// into the cached HTML but the CSP header is re-derived each request, so a
	// cached page would ship with a dead nonce and the browser would block its
	// inline scripts. Operators who turn on CSP_DIRECTIVES forfeit the cache.
	const cacheable =
		CACHE_ENABLED && !CSP_ENABLED && pageMod.cache !== false && req.method === "GET";
	let cacheKey: string | null = null;
	if (cacheable) {
		cacheKey = computeCacheKey(url, req, cookies);
		if (!cacheBypass) {
			const hit = cacheGet(cacheKey);
			if (hit) return serveCached(hit, req);
		}
	}

	// ── Pre-stream phase: resolve metadata before committing to a 200 ──
	// Errors here return a proper error response with correct status code.
	let metadata: Metadata | null = null;
	try {
		metadata = await loadMetadata(route, params, url, locals, cookies, req);
	} catch (err) {
		if (err instanceof Redirect) {
			return Response.redirect(err.location, err.status);
		}
		if (err instanceof HttpError) {
			return renderErrorPage(
				err.status,
				err.message,
				url,
				req,
				route,
				undefined,
				undefined,
				undefined,
				nonce,
			);
		}
		if (isDev) console.error("Metadata load error:", err);
		else console.error("Metadata load error:", (err as Error).message ?? err);
		if (isDev) reportDevErrorFromCatch(err);
		// Continue with null metadata — don't break the page for a metadata failure
	}

	// ── Pre-stream phase: run load() + module imports in parallel before committing to a 200 ──
	// This ensures HttpError/Redirect from load() can return a proper response before any bytes are sent.
	const metadataData = metadata?.data ?? null;
	let data: Awaited<ReturnType<typeof loadRouteData>>;
	let layoutMods: any[];

	try {
		[data, layoutMods] = await Promise.all([
			loadRouteData(url, locals, req, cookies, metadataData, match),
			Promise.all(route.layoutModules.map((l: () => Promise<any>) => l())),
		]);
	} catch (err) {
		if (err instanceof Redirect) return Response.redirect(err.location, err.status);
		if (err instanceof HttpError) {
			const e = err as HttpError & {
				errorDepth?: number;
				errorOrigin?: ErrorOrigin;
				partialLayoutData?: Record<string, any>[];
			};
			return renderErrorPage(
				err.status,
				err.message,
				url,
				req,
				route,
				e.errorDepth,
				e.errorOrigin,
				e.partialLayoutData,
				nonce,
			);
		}
		if (isDev) console.error("SSR load error:", err);
		else console.error("SSR load error:", (err as Error).message ?? err);
		if (isDev) reportDevErrorFromCatch(err);
		return renderErrorPage(
			500,
			"Internal Server Error",
			url,
			req,
			route,
			undefined,
			undefined,
			undefined,
			nonce,
		);
	}

	if (!data)
		return renderErrorPage(
			404,
			"Not Found",
			url,
			req,
			undefined,
			undefined,
			undefined,
			undefined,
			nonce,
		);

	const enc = new TextEncoder();
	const renderCtx: RenderContext = {
		request: req,
		url,
		route: { pattern: route.pattern },
		metadata,
	};
	const [headExtras, bodyEndExtras] = await Promise.all([
		pluginRenderFragments("head", renderCtx),
		pluginRenderFragments("bodyEnd", renderCtx),
	]);

	// SSR always runs every loader, so coerce types from the optional sparse shape.
	const layoutDataFull = (data.layoutData as Record<string, any>[]).map((d) => d ?? {});
	const pageDataFull = data.pageData ?? {};

	// ssr=false → no render() needed; ship shell + hydration as a single response.
	// ssr=false && csr=false is meaningless (nothing renders) — force csr=true.
	if (!data.ssr) {
		if (!data.csr && isDev) {
			console.warn(
				`⚠️  ${url.pathname}: ssr=false && csr=false renders nothing — forcing csr=true`,
			);
		}
		const html =
			buildHtmlShellOpen(metadata?.lang, nonce, appHtmlSegments) +
			buildMetadataChunk(metadata, headExtras, appHtmlSegments) +
			buildHtmlTail(
				"",
				"",
				pageDataFull,
				layoutDataFull,
				true,
				null,
				false,
				bodyEndExtras,
				nonce,
				data.pageDeps,
				data.layoutDeps,
				appHtmlSegments,
			);
		return new Response(html, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	}

	// Render-first: run render() before committing to a 200. Failure → proper error page
	// with correct status code, instead of a bare <p> mixed into an already-flushed shell.
	let body: string, head: string;
	try {
		({ body, head } = render(App, {
			props: {
				ssrMode: true,
				ssrPageComponent: pageMod.default,
				ssrLayoutComponents: layoutMods.map((m: any) => m.default),
				ssrPageData: pageDataFull,
				ssrLayoutData: layoutDataFull,
			},
		}));
	} catch (err) {
		if (isDev) console.error("SSR render error:", err);
		else console.error("SSR render error:", (err as Error).message ?? err);
		if (isDev) reportDevErrorFromCatch(err);
		// Render-phase errors fall through to deepest boundary like a page error.
		return renderErrorPage(
			500,
			"Internal Server Error",
			url,
			req,
			route,
			route.layoutModules.length,
			"page",
			layoutDataFull,
			nonce,
		);
	}

	// Pre-compute all chunks; pull-based stream gives Bun native backpressure.
	const chunks: Uint8Array[] = [
		enc.encode(buildHtmlShellOpen(metadata?.lang, nonce, appHtmlSegments)),
		enc.encode(buildMetadataChunk(metadata, headExtras, appHtmlSegments)),
		enc.encode(
			buildHtmlTail(
				body,
				head,
				pageDataFull,
				layoutDataFull,
				data.csr,
				null,
				true,
				bodyEndExtras,
				nonce,
				data.pageDeps,
				data.layoutDeps,
				appHtmlSegments,
			),
		),
	];

	// ── Response cache: write after chunks built, before stream creation ──
	// Skip if the handler set cookies — cached response can't reproduce
	// per-request Set-Cookie headers. Compression runs in a microtask so
	// the response goes out first.
	if (cacheable && cacheKey && (cookies as any).outgoing?.length === 0) {
		const fullBody = concatChunks(chunks);
		const tags = collectTags(data.layoutDeps ?? null, data.pageDeps ?? null);
		const keyForWrite = cacheKey;
		queueMicrotask(() => {
			const { gzip, brotli } = buildCompressedVariants(fullBody);
			cacheSet(keyForWrite, {
				raw: fullBody,
				gzip,
				brotli,
				contentType: "text/html; charset=utf-8",
				status: 200,
				extraHeaders: {},
				tags,
			});
		});
	}

	let i = 0;
	let cancelled = false;
	const onAbort = () => {
		cancelled = true;
	};
	req.signal.addEventListener("abort", onAbort, { once: true });

	const stream = new ReadableStream<Uint8Array>({
		pull(controller) {
			if (cancelled || i >= chunks.length) {
				controller.close();
				req.signal.removeEventListener("abort", onAbort);
				return;
			}
			controller.enqueue(chunks[i++]);
			if (i >= chunks.length) {
				controller.close();
				req.signal.removeEventListener("abort", onAbort);
			}
		},
		cancel() {
			cancelled = true;
			req.signal.removeEventListener("abort", onAbort);
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}

// ─── Form Action Page Renderer ───────────────────────────
// Re-runs load functions after a form action, renders with form data.
// Uses non-streaming buildHtml so we can control the status code.

export async function renderPageWithFormData(
	url: URL,
	locals: Record<string, any>,
	req: Request,
	cookies: Cookies,
	formData: any,
	status: number,
	match?: RouteMatch<(typeof serverRoutes)[number]> | null,
): Promise<Response> {
	const nonce = CSP_ENABLED && typeof locals.nonce === "string" ? locals.nonce : undefined;
	match ??= findMatch(serverRoutes, url.pathname);
	if (!match)
		return renderErrorPage(
			404,
			"Not Found",
			url,
			req,
			undefined,
			undefined,
			undefined,
			undefined,
			nonce,
		);

	const { route } = match;

	// Load components + data in parallel
	const [data, pageMod, layoutMods] = await Promise.all([
		loadRouteData(url, locals, req, cookies, null, match),
		route.pageModule(),
		Promise.all(route.layoutModules.map((l: () => Promise<any>) => l())),
	]);

	if (!data)
		return renderErrorPage(
			404,
			"Not Found",
			url,
			req,
			undefined,
			undefined,
			undefined,
			undefined,
			nonce,
		);

	// Form-action re-render always runs every loader (no client mask).
	const layoutDataFull = (data.layoutData as Record<string, any>[]).map((d) => d ?? {});
	const pageDataFull = data.pageData ?? {};

	if (!data.ssr) {
		if (!data.csr && isDev) {
			console.warn(
				`⚠️  ${url.pathname}: ssr=false && csr=false renders nothing — forcing csr=true`,
			);
		}
		const html = buildHtml(
			"",
			"",
			pageDataFull,
			layoutDataFull,
			true,
			formData,
			undefined,
			false,
			nonce,
			data.pageDeps,
			data.layoutDeps,
			undefined,
			appHtmlSegments,
		);
		return compress(html, "text/html; charset=utf-8", req, status);
	}

	const { body, head } = render(App, {
		props: {
			ssrMode: true,
			ssrPageComponent: pageMod.default,
			ssrLayoutComponents: layoutMods.map((m: any) => m.default),
			ssrPageData: pageDataFull,
			ssrLayoutData: layoutDataFull,
			ssrFormData: formData,
		},
	});

	const html = buildHtml(
		body,
		head,
		pageDataFull,
		layoutDataFull,
		data.csr,
		formData,
		undefined,
		true,
		nonce,
		data.pageDeps,
		data.layoutDeps,
		undefined,
		appHtmlSegments,
	);
	return compress(html, "text/html; charset=utf-8", req, status);
}

// ─── Error Page Renderer ──────────────────────────────────
// 1. If a route is known, try the nearest nested +error.svelte and render
//    it inside the matching prefix of the layout chain.
// 2. Otherwise fall back to the global root +error.svelte.
// 3. Otherwise return a plain-text response.

export async function renderErrorPage(
	status: number,
	message: string,
	url: URL,
	req: Request,
	route?: any,
	errorDepth?: number,
	errorOrigin?: ErrorOrigin,
	partialLayoutData?: (Record<string, any> | null)[],
	nonce?: string,
): Promise<Response> {
	// Strip the nonce from emitted scripts when CSP is off — the attribute
	// is dead bytes without a matching policy header.
	if (!CSP_ENABLED) nonce = undefined;

	// Inspector overlay and other plugin bodyEnd fragments must be injected
	// on error pages too — otherwise SSE never connects and runtime errors
	// from the failing render are invisible in the UI.
	const renderCtx: RenderContext = {
		request: req,
		url,
		route: route ? { pattern: route.pattern } : { pattern: "" },
		metadata: null,
	};
	const bodyEndExtras = await pluginRenderFragments("bodyEnd", renderCtx);

	// 1. Nested boundary
	if (route && errorDepth !== undefined && route.errorPages?.length) {
		const origin = errorOrigin ?? "page";
		const picked = pickErrorPage<() => Promise<any>>(
			route.errorPages as { loader: () => Promise<any>; depth: number }[],
			errorDepth,
			origin,
		);
		if (picked) {
			try {
				const K = picked.depth;
				const [errorMod, layoutMods] = await Promise.all([
					picked.loader(),
					Promise.all(route.layoutModules.slice(0, K).map((l: () => Promise<any>) => l())),
				]);
				const layoutData: Record<string, any>[] = [];
				for (let i = 0; i < K; i++) layoutData.push(partialLayoutData?.[i] ?? {});
				const { body, head } = render(App, {
					props: {
						ssrMode: true,
						ssrLayoutComponents: layoutMods.map((m: any) => m.default),
						ssrLayoutData: layoutData,
						ssrErrorComponent: errorMod.default,
						ssrErrorProps: { error: { status, message } },
						ssrErrorDepth: K,
					},
				});
				// csr=false: no client hydration on the error page itself.
				const html = buildHtml(
					body,
					head,
					{ status, message },
					layoutData,
					false,
					null,
					undefined,
					true,
					nonce,
					null,
					null,
					bodyEndExtras,
					appHtmlSegments,
				);
				return compress(html, "text/html; charset=utf-8", req, status);
			} catch (err) {
				if (isDev) console.error("Nested error page render failed:", err);
				else console.error("Nested error page render failed:", (err as Error).message ?? err);
				if (isDev) reportDevErrorFromCatch(err);
				// fall through to global / text fallback
			}
		}
	}

	// 2. Global root error page
	if (errorPage) {
		try {
			const mod = await errorPage();
			// Render the error component directly — NOT through App.svelte.
			// App.svelte remaps ssrPageData to a `data` prop, but +error.svelte
			// expects `error` as a direct prop: `let { error } = $props()`.
			const { body, head } = render(mod.default, {
				props: { error: { status, message } },
			});
			const html = buildHtml(
				body,
				head,
				{ status, message },
				[],
				false,
				null,
				undefined,
				true,
				nonce,
				null,
				null,
				bodyEndExtras,
				appHtmlSegments,
			);
			return compress(html, "text/html; charset=utf-8", req, status);
		} catch (err) {
			if (isDev) console.error("Error page render failed:", err);
			else console.error("Error page render failed:", (err as Error).message ?? err);
			if (isDev) reportDevErrorFromCatch(err);
		}
	}
	// Dev: render an HTML 500 page that subscribes to /__bosia/sse so the browser
	// auto-reloads the moment the next build succeeds. Without this the user stares
	// at "Internal Server Error" forever even after fixing the source. Pass the
	// already-computed bodyEndExtras so the inspector overlay (red error badge,
	// pre-seeded buffered errors) stays attached even on this bare-fallback path.
	if (isDev) {
		return dev500Response({ request: req, status, message, bodyEndExtras });
	}
	return new Response(message, {
		status,
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
