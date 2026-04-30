import { render } from "svelte/server";

import { findMatch } from "./matcher.ts";
import { serverRoutes, errorPage } from "bosia:routes";
import type { Cookies } from "./hooks.ts";
import { HttpError, Redirect } from "./errors.ts";
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

// ─── Route Data Loader ───────────────────────────────────
// Runs layout + page server loaders for a given URL.
// Used by both SSR and the /__bosia/data JSON endpoint.

export async function loadRouteData(
	url: URL,
	locals: Record<string, any>,
	req: Request,
	cookies: Cookies,
	metadataData: Record<string, any> | null = null,
) {
	const match = findMatch(serverRoutes, url.pathname);
	if (!match) return null;

	const { route, params } = match;
	const fetch = makeFetch(req, url);
	const layoutData: Record<string, any>[] = [];

	// Run layout server loaders root → leaf, each gets parent() data
	for (const ls of route.layoutServers) {
		try {
			const mod = await ls.loader();
			if (typeof mod.load === "function") {
				const parent = async () => {
					const merged: Record<string, any> = {};
					for (let d = 0; d < ls.depth; d++) Object.assign(merged, layoutData[d] ?? {});
					return merged;
				};
				layoutData[ls.depth] =
					(await withTimeout(
						mod.load({ params, url, locals, cookies, parent, fetch, metadata: null }),
						LOAD_TIMEOUT,
						`layout load (depth=${ls.depth}, ${url.pathname})`,
					)) ?? {};
			}
		} catch (err) {
			if (err instanceof HttpError || err instanceof Redirect) throw err;
			if (isDev) console.error("Layout server load error:", err);
			else console.error("Layout server load error:", (err as Error).message ?? err);
			throw new HttpError(500, "Internal Server Error");
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
				const parent = async () => {
					const merged: Record<string, any> = {};
					for (const d of layoutData) if (d) Object.assign(merged, d);
					return merged;
				};
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
			if (err instanceof HttpError || err instanceof Redirect) throw err;
			if (isDev) console.error("Page server load error:", err);
			else console.error("Page server load error:", (err as Error).message ?? err);
			throw new HttpError(500, "Internal Server Error");
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
): Promise<Response | null> {
	const match = findMatch(serverRoutes, url.pathname);
	if (!match) return null;

	const { route, params } = match;

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
			return renderErrorPage(err.status, err.message, url, req);
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
			loadRouteData(url, locals, req, cookies, metadataData),
			route.pageModule(),
			Promise.all(route.layoutModules.map((l: () => Promise<any>) => l())),
		]);
	} catch (err) {
		if (err instanceof Redirect) return Response.redirect(err.location, err.status);
		if (err instanceof HttpError) return renderErrorPage(err.status, err.message, url, req);
		if (isDev) console.error("SSR load error:", err);
		else console.error("SSR load error:", (err as Error).message ?? err);
		return renderErrorPage(500, "Internal Server Error", url, req);
	}

	if (!data) return renderErrorPage(404, "Not Found", url, req);

	const enc = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			// Chunk 1: head opening (CSS, modulepreload — cached per lang)
			controller.enqueue(enc.encode(buildHtmlShellOpen(metadata?.lang)));

			// Chunk 2: metadata tags, close </head>, open <body> + spinner
			controller.enqueue(enc.encode(buildMetadataChunk(metadata)));

			try {
				if (!data!.ssr) {
					// ssr=false → skip render(); ship empty shell + hydration scripts.
					// ssr=false && csr=false is meaningless (nothing renders) — force csr=true.
					if (!data!.csr && isDev) {
						console.warn(
							`⚠️  ${url.pathname}: ssr=false && csr=false renders nothing — forcing csr=true`,
						);
					}
					controller.enqueue(
						enc.encode(
							buildHtmlTail(
								"",
								"",
								data!.pageData,
								data!.layoutData,
								true,
								null,
								false,
							),
						),
					);
					controller.close();
					return;
				}

				const { body, head } = render(App, {
					props: {
						ssrMode: true,
						ssrPageComponent: pageMod.default,
						ssrLayoutComponents: layoutMods.map((m: any) => m.default),
						ssrPageData: data!.pageData,
						ssrLayoutData: data!.layoutData,
					},
				});

				// Chunk 3: rendered content
				controller.enqueue(
					enc.encode(
						buildHtmlTail(body, head, data!.pageData, data!.layoutData, data!.csr),
					),
				);
				controller.close();
			} catch (err) {
				// Only render() can throw here — data is already loaded successfully
				if (isDev) console.error("SSR render error:", err);
				else console.error("SSR render error:", (err as Error).message ?? err);
				controller.enqueue(enc.encode(`<p>Internal Server Error</p></body></html>`));
				controller.close();
			}
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
): Promise<Response> {
	const match = findMatch(serverRoutes, url.pathname);
	if (!match) return renderErrorPage(404, "Not Found", url, req);

	const { route } = match;

	// Load components + data in parallel
	const [data, pageMod, layoutMods] = await Promise.all([
		loadRouteData(url, locals, req, cookies),
		route.pageModule(),
		Promise.all(route.layoutModules.map((l: () => Promise<any>) => l())),
	]);

	if (!data) return renderErrorPage(404, "Not Found", url, req);

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

	const html = buildHtml(body, head, data.pageData, data.layoutData, data.csr, formData);
	return compress(html, "text/html; charset=utf-8", req, status);
}

// ─── Error Page Renderer ──────────────────────────────────

export async function renderErrorPage(
	status: number,
	message: string,
	url: URL,
	req: Request,
): Promise<Response> {
	if (errorPage) {
		try {
			const mod = await errorPage();
			// Render the error component directly — NOT through App.svelte.
			// App.svelte always remaps ssrPageData to a `data` prop, but +error.svelte
			// expects `error` as a direct prop: `let { error } = $props()`.
			const { body, head } = render(mod.default, {
				props: { error: { status, message } },
			});
			const html = buildHtml(body, head, { status, message }, [], false);
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
