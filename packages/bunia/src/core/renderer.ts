import { render } from "svelte/server";

import { findMatch } from "./matcher.ts";
import { serverRoutes, errorPage } from "bunia:routes";
import type { Cookies } from "./hooks.ts";
import { HttpError, Redirect } from "./errors.ts";
import App from "./client/App.svelte";
import { buildHtml, compress } from "./html.ts";

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
                layoutData[ls.depth] = (await mod.load({ params, url, locals, cookies, parent, fetch })) ?? {};
            }
        } catch (err) {
            if (err instanceof HttpError || err instanceof Redirect) throw err;
            console.error("Layout server load error:", err);
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
                pageData = (await mod.load({ params, url, locals, cookies, parent, fetch })) ?? {};
            }
        } catch (err) {
            if (err instanceof HttpError || err instanceof Redirect) throw err;
            console.error("Page server load error:", err);
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
            console.error("Error page render failed:", err);
        }
    }
    return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
