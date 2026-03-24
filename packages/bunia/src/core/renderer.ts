import { render } from "svelte/server";

import { findMatch } from "./matcher.ts";
import { serverRoutes, errorPage } from "bunia:routes";
import type { Cookies } from "./hooks.ts";
import { HttpError, Redirect } from "./errors.ts";
import App from "./client/App.svelte";
import { buildHtml, buildHtmlShell, buildHtmlShellOpen, buildMetadataChunk, buildHtmlTail, compress, safeJsonStringify, isDev } from "./html.ts";
import type { Metadata } from "./hooks.ts";

// ─── Session-Aware Fetch ─────────────────────────────────
// Passed to load() functions so they can call internal APIs
// with the current user's cookies automatically forwarded.

function makeFetch(req: Request, url: URL) {
    const cookie = req.headers.get("cookie") ?? "";
    const origin = url.origin;

    return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const resolved =
            typeof input === "string" && input.startsWith("/")
                ? `${origin}${input}`
                : input;

        const headers = new Headers(init?.headers);
        if (cookie && !headers.has("cookie")) headers.set("cookie", cookie);

        return globalThis.fetch(resolved, { ...init, headers });
    };
}

// ─── Route Data Loader ───────────────────────────────────
// Runs layout + page server loaders for a given URL.
// Used by both SSR and the /__bunia/data JSON endpoint.

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
                layoutData[ls.depth] = (await mod.load({ params, url, locals, cookies, parent, fetch, metadata: null })) ?? {};
            }
        } catch (err) {
            if (err instanceof HttpError || err instanceof Redirect) throw err;
            if (isDev) console.error("Layout server load error:", err);
            else console.error("Layout server load error:", (err as Error).message ?? err);
        }
    }

    // Run page server loader
    let pageData: Record<string, any> = {};
    let csr = true;
    if (route.pageServer) {
        try {
            const mod = await route.pageServer();
            if (mod.csr === false) csr = false;
            if (typeof mod.load === "function") {
                const parent = async () => {
                    const merged: Record<string, any> = {};
                    for (const d of layoutData) if (d) Object.assign(merged, d);
                    return merged;
                };
                pageData = (await mod.load({ params, url, locals, cookies, parent, fetch, metadata: metadataData })) ?? {};
            }
        } catch (err) {
            if (err instanceof HttpError || err instanceof Redirect) throw err;
            if (isDev) console.error("Page server load error:", err);
            else console.error("Page server load error:", (err as Error).message ?? err);
        }
    }

    return { pageData: { ...pageData, params }, layoutData, csr };
}

// ─── SSR Renderer ────────────────────────────────────────

export async function renderSSR(url: URL, locals: Record<string, any>, req: Request, cookies: Cookies) {
    const match = findMatch(serverRoutes, url.pathname);
    if (!match) return null;

    const { route } = match;

    // Kick off component imports in parallel with data loading
    const pageModPromise = route.pageModule();
    const layoutModsPromise = Promise.all(route.layoutModules.map((l: () => Promise<any>) => l()));

    const data = await loadRouteData(url, locals, req, cookies);
    if (!data) return null;

    const [pageMod, layoutMods] = await Promise.all([pageModPromise, layoutModsPromise]);

    const { body, head } = render(App, {
        props: {
            ssrMode: true,
            ssrPageComponent: pageMod.default,
            ssrLayoutComponents: layoutMods.map((m: any) => m.default),
            ssrPageData: data.pageData,
            ssrLayoutData: data.layoutData,
        },
    });

    return { body, head, pageData: data.pageData, layoutData: data.layoutData, csr: data.csr };
}

// ─── Metadata Loader ─────────────────────────────────────

async function loadMetadata(
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
            return (await mod.metadata({ params, url, locals, cookies, fetch })) ?? null;
        }
    } catch (err) {
        if (isDev) console.error("Metadata load error:", err);
        else console.error("Metadata load error:", (err as Error).message ?? err);
    }
    return null;
}

// ─── Streaming SSR Renderer ──────────────────────────────

export function renderSSRStream(
    url: URL,
    locals: Record<string, any>,
    req: Request,
    cookies: Cookies,
): Response | null {
    const match = findMatch(serverRoutes, url.pathname);
    if (!match) return null;

    const { route, params } = match;
    const enc = new TextEncoder();

    // Kick off imports immediately (parallel with data loading)
    const pageModPromise = route.pageModule();
    const layoutModsPromise = Promise.all(route.layoutModules.map((l: () => Promise<any>) => l()));

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            // Chunk 1: head opening (CSS, modulepreload — cached)
            controller.enqueue(enc.encode(buildHtmlShellOpen()));

            try {
                // Chunk 2: metadata() resolves → send title/meta, close head, open body + spinner
                const metadata = await loadMetadata(route, params, url, locals, cookies, req);
                controller.enqueue(enc.encode(buildMetadataChunk(metadata)));

                // Pass metadata.data to load() so it can reuse fetched data
                const metadataData = metadata?.data ?? null;

                // Wait for data + component imports
                const [data, pageMod, layoutMods] = await Promise.all([
                    loadRouteData(url, locals, req, cookies, metadataData),
                    pageModPromise,
                    layoutModsPromise,
                ]);

                if (!data) {
                    controller.enqueue(enc.encode(`</body></html>`));
                    controller.close();
                    return;
                }

                const { body, head } = render(App, {
                    props: {
                        ssrMode: true,
                        ssrPageComponent: pageMod.default,
                        ssrLayoutComponents: layoutMods.map((m: any) => m.default),
                        ssrPageData: data.pageData,
                        ssrLayoutData: data.layoutData,
                    },
                });

                // Chunk 3: rendered content
                controller.enqueue(enc.encode(buildHtmlTail(body, head, data.pageData, data.layoutData, data.csr)));
                controller.close();
            } catch (err) {
                if (err instanceof Redirect) {
                    controller.enqueue(enc.encode(
                        `<script>location.replace(${safeJsonStringify(err.location)})</script></body></html>`
                    ));
                    controller.close();
                    return;
                }
                if (err instanceof HttpError) {
                    controller.enqueue(enc.encode(
                        `<script>location.replace("/__bunia/error?status=${err.status}&message=${encodeURIComponent(err.message)}")</script></body></html>`
                    ));
                    controller.close();
                    return;
                }
                if (isDev) console.error("SSR stream error:", err);
                else console.error("SSR stream error:", (err as Error).message ?? err);
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

export async function renderErrorPage(status: number, message: string, url: URL, req: Request): Promise<Response> {
    if (errorPage) {
        try {
            const mod = await errorPage();
            const { body, head } = render(App, {
                props: {
                    ssrMode: true,
                    ssrPageComponent: mod.default,
                    ssrLayoutComponents: [],
                    ssrPageData: { status, message },
                    ssrLayoutData: [],
                },
            });
            const html = buildHtml(body, head, { status, message }, [], false);
            return compress(html, "text/html; charset=utf-8", req, status);
        } catch (err) {
            if (isDev) console.error("Error page render failed:", err);
            else console.error("Error page render failed:", (err as Error).message ?? err);
        }
    }
    return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
