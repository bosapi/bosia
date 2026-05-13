import { render } from "svelte/server";

import { findMatch } from "./matcher.ts";
import { serverRoutes, errorPage } from "bosia:routes";
import type { RouteMatch } from "./types.ts";
import type { Cookies } from "./hooks.ts";
import { CSP_ENABLED } from "./csp.ts";
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
import type { BosiaPlugin, RenderContext } from "./types/plugin.ts";

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
			targetOrigin !== null &&
			(targetOrigin === sameOrigin || INTERNAL_HOSTS.has(targetOrigin));
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

// ─── Route Data Loader ───────────────────────────────────
// Runs layout + page server loaders for a given URL.
// Used by both SSR and the /__bosia/data JSON endpoint.

export async function loadRouteData(
	url: URL,
	locals: Record<string, any>,
	req: Request,
	cookies: Cookies,
	metadataData: Record<string, any> | null = null,
	match?: RouteMatch<(typeof serverRoutes)[number]> | null,
) {
	match ??= findMatch(serverRoutes, url.pathname);
	if (!match) return null;

	const { route, params } = match;
	const fetch = makeFetch(req, url);
	const layoutData: Record<string, any>[] = [];
	let parentData: Record<string, any> = {};

	// Run layout server loaders root → leaf, each gets parent() data
	for (const ls of route.layoutServers) {
		try {
			const mod = await ls.loader();
			if (typeof mod.load === "function") {
				// Snapshot per layer so loaders cannot mutate the shared accumulator,
				// preserving the same isolation semantics as the previous merge-on-call code.
				const snapshot = { ...parentData };
				const parent = async () => snapshot;
				const result =
					(await withTimeout(
						mod.load({ params, url, locals, cookies, parent, fetch, metadata: null }),
						LOAD_TIMEOUT,
						`layout load (depth=${ls.depth}, ${url.pathname})`,
					)) ?? {};
				layoutData[ls.depth] = result;
				parentData = { ...parentData, ...result };
			}
		} catch (err) {
			if (err instanceof Redirect) throw err;
			if (err instanceof HttpError) {
				stampErrorContext(err, ls.depth, "layout", layoutData);
				throw err;
			}
			if (isDev) console.error("Layout server load error:", err);
			else console.error("Layout server load error:", (err as Error).message ?? err);
			const wrapped = new HttpError(500, "Internal Server Error");
			stampErrorContext(wrapped, ls.depth, "layout", layoutData);
			throw wrapped;
		}
	}

	// Run page server loader
	let pageData: Record<string, any> = {};
	let csr = true;
	let ssr = true;
	if (route.pageServer) {
		try {
			const mod = await route.pageServer();
			if (mod.csr === false) csr = false;
			if (mod.ssr === false) ssr = false;
			if (typeof mod.load === "function") {
				const snapshot = { ...parentData };
				const parent = async () => snapshot;
				pageData =
					(await withTimeout(
						mod.load({
							params,
							url,
							locals,
							cookies,
							parent,
							fetch,
							metadata: metadataData,
						}),
						LOAD_TIMEOUT,
						`page load (${url.pathname})`,
					)) ?? {};
			}
		} catch (err) {
			if (err instanceof Redirect) throw err;
			if (err instanceof HttpError) {
				stampErrorContext(err, route.layoutModules.length, "page", layoutData);
				throw err;
			}
			if (isDev) console.error("Page server load error:", err);
			else console.error("Page server load error:", (err as Error).message ?? err);
			const wrapped = new HttpError(500, "Internal Server Error");
			stampErrorContext(wrapped, route.layoutModules.length, "page", layoutData);
			throw wrapped;
		}
	}

	return { pageData: { ...pageData, params }, layoutData, csr, ssr };
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
		// Continue with null metadata — don't break the page for a metadata failure
	}

	// ── Pre-stream phase: run load() + module imports in parallel before committing to a 200 ──
	// This ensures HttpError/Redirect from load() can return a proper response before any bytes are sent.
	const metadataData = metadata?.data ?? null;
	let data: Awaited<ReturnType<typeof loadRouteData>>;
	let pageMod: any;
	let layoutMods: any[];

	try {
		[data, pageMod, layoutMods] = await Promise.all([
			loadRouteData(url, locals, req, cookies, metadataData, match),
			route.pageModule(),
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

	// ssr=false → no render() needed; ship shell + hydration as a single response.
	// ssr=false && csr=false is meaningless (nothing renders) — force csr=true.
	if (!data.ssr) {
		if (!data.csr && isDev) {
			console.warn(
				`⚠️  ${url.pathname}: ssr=false && csr=false renders nothing — forcing csr=true`,
			);
		}
		const html =
			buildHtmlShellOpen(metadata?.lang, nonce) +
			buildMetadataChunk(metadata, headExtras) +
			buildHtmlTail(
				"",
				"",
				data.pageData,
				data.layoutData,
				true,
				null,
				false,
				bodyEndExtras,
				nonce,
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
				ssrPageData: data.pageData,
				ssrLayoutData: data.layoutData,
			},
		}));
	} catch (err) {
		if (isDev) console.error("SSR render error:", err);
		else console.error("SSR render error:", (err as Error).message ?? err);
		// Render-phase errors fall through to deepest boundary like a page error.
		return renderErrorPage(
			500,
			"Internal Server Error",
			url,
			req,
			route,
			route.layoutModules.length,
			"page",
			data.layoutData,
			nonce,
		);
	}

	// Pre-compute all chunks; pull-based stream gives Bun native backpressure.
	const chunks: Uint8Array[] = [
		enc.encode(buildHtmlShellOpen(metadata?.lang, nonce)),
		enc.encode(buildMetadataChunk(metadata, headExtras)),
		enc.encode(
			buildHtmlTail(
				body,
				head,
				data.pageData,
				data.layoutData,
				data.csr,
				null,
				true,
				bodyEndExtras,
				nonce,
			),
		),
	];

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

	if (!data.ssr) {
		if (!data.csr && isDev) {
			console.warn(
				`⚠️  ${url.pathname}: ssr=false && csr=false renders nothing — forcing csr=true`,
			);
		}
		const html = buildHtml(
			"",
			"",
			data.pageData,
			data.layoutData,
			true,
			formData,
			undefined,
			false,
			nonce,
		);
		return compress(html, "text/html; charset=utf-8", req, status);
	}

	const { body, head } = render(App, {
		props: {
			ssrMode: true,
			ssrPageComponent: pageMod.default,
			ssrLayoutComponents: layoutMods.map((m: any) => m.default),
			ssrPageData: data.pageData,
			ssrLayoutData: data.layoutData,
			ssrFormData: formData,
		},
	});

	const html = buildHtml(
		body,
		head,
		data.pageData,
		data.layoutData,
		data.csr,
		formData,
		undefined,
		true,
		nonce,
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
	partialLayoutData?: Record<string, any>[],
	nonce?: string,
): Promise<Response> {
	// Strip the nonce from emitted scripts when CSP is off — the attribute
	// is dead bytes without a matching policy header.
	if (!CSP_ENABLED) nonce = undefined;
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
					Promise.all(
						route.layoutModules.slice(0, K).map((l: () => Promise<any>) => l()),
					),
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
				);
				return compress(html, "text/html; charset=utf-8", req, status);
			} catch (err) {
				if (isDev) console.error("Nested error page render failed:", err);
				else
					console.error(
						"Nested error page render failed:",
						(err as Error).message ?? err,
					);
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
			);
			return compress(html, "text/html; charset=utf-8", req, status);
		} catch (err) {
			if (isDev) console.error("Error page render failed:", err);
			else console.error("Error page render failed:", (err as Error).message ?? err);
		}
	}
	return new Response(message, {
		status,
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
