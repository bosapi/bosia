import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { existsSync } from "fs";
import { join } from "path";

import { findMatch } from "./matcher.ts";
import { apiRoutes } from "bunia:routes";
import type { Handle, RequestEvent } from "./hooks.ts";
import { HttpError, Redirect } from "./errors.ts";
import { CookieJar } from "./cookies.ts";
import { isDev, buildHtml, compress, isStaticPath } from "./html.ts";
import { loadRouteData, renderSSR, renderErrorPage } from "./renderer.ts";

// ─── User Hooks ──────────────────────────────────────────
// Load src/hooks.server.ts if present. Uses process.cwd() so
// Bun can resolve it at runtime without bundling user code.

let userHandle: Handle | null = null;

const hooksPath = join(process.cwd(), "src", "hooks.server.ts");
if (existsSync(hooksPath)) {
    try {
        const mod = await import(hooksPath);
        if (typeof mod.handle === "function") {
            userHandle = mod.handle as Handle;
            console.log("🪝 Loaded hooks.server.ts");
        }
    } catch (err) {
        console.warn("⚠️  Failed to load hooks.server.ts:", err);
    }
}

// ─── Core Request Resolver ────────────────────────────────
// This is the inner handler that hooks wrap around.

async function resolve(event: RequestEvent): Promise<Response> {
    const { request, url, locals, cookies } = event;
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // Health check endpoint — for load balancers and orchestrators
    if (path === "/_health") {
        return Response.json({ status: "ok", timestamp: new Date().toISOString() });
    }

    // Data endpoint — returns server loader data as JSON for client-side navigation
    if (path === "/__bunia/data") {
        const routePath = url.searchParams.get("path") ?? "/";
        const routeUrl = new URL(routePath, url.origin);
        // Rewrite event.url so logging middleware sees the real page path, not /__bunia/data
        event.url = routeUrl;
        try {
            const data = await loadRouteData(routeUrl, locals, request, cookies);
            if (!data) return compress(JSON.stringify({ pageData: {}, layoutData: [] }), "application/json", request);
            return compress(JSON.stringify(data), "application/json", request);
        } catch (err) {
            if (err instanceof Redirect) {
                return compress(JSON.stringify({ redirect: err.location, status: err.status }), "application/json", request);
            }
            if (err instanceof HttpError) {
                return compress(JSON.stringify({ error: err.message, status: err.status }), "application/json", request, err.status);
            }
            console.error("Data endpoint error:", err);
            return Response.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    // Static files
    if (isStaticPath(path)) {
        // dist/client: serve with cache headers based on whether filename is hashed
        if (path.startsWith("/dist/client/")) {
            const file = Bun.file(`.${path.split("?")[0]}`);
            if (await file.exists()) {
                const filename = path.split("/").pop() ?? "";
                const isHashed = /\-[a-z0-9]{8,}\.[a-z]+$/.test(filename);
                const cacheControl = !isDev && isHashed
                    ? "public, max-age=31536000, immutable"
                    : "no-cache";
                return new Response(file, { headers: { "Cache-Control": cacheControl } });
            }
            return new Response("Not Found", { status: 404 });
        }
        const pub = Bun.file(`./public${path}`);
        if (await pub.exists()) return new Response(pub);
        const dist = Bun.file(`.${path}`);
        if (await dist.exists()) return new Response(dist);
        return new Response("Not Found", { status: 404 });
    }

    // Prerendered pages — serve static HTML built at build time
    const prerenderFile = Bun.file(
        path === "/" ? "./dist/prerendered/index.html" : `./dist/prerendered${path}/index.html`
    );
    if (await prerenderFile.exists()) {
        return new Response(prerenderFile, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "public, max-age=3600",
            },
        });
    }

    // API routes (+server.ts)
    const apiMatch = findMatch(apiRoutes, path);
    if (apiMatch) {
        try {
            const mod = await apiMatch.route.module();
            const handler = mod[method];

            if (!handler) {
                const allowed = Object.keys(mod).filter(k => /^[A-Z]+$/.test(k)).join(", ");
                return Response.json(
                    { error: `Method ${method} not allowed` },
                    { status: 405, headers: { Allow: allowed } },
                );
            }

            event.params = apiMatch.params;
            return await handler({ request, params: apiMatch.params, url, locals, cookies });
        } catch (err) {
            console.error("API route error:", err);
            return Response.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    // SSR pages (+page.svelte)
    try {
        const ssr = await renderSSR(url, locals, request, cookies);
        if (!ssr) {
            return renderErrorPage(404, "Not Found", url, request);
        }
        const html = buildHtml(ssr.body, ssr.head, ssr.pageData, ssr.layoutData, ssr.csr);
        return compress(html, "text/html; charset=utf-8", request);
    } catch (err) {
        if (err instanceof Redirect) {
            return new Response(null, { status: err.status, headers: { Location: err.location } });
        }
        if (err instanceof HttpError) {
            return renderErrorPage(err.status, err.message, url, request);
        }
        console.error("SSR error:", err);
        return renderErrorPage(500, "Internal Server Error", url, request);
    }
}

// ─── Request Entry ────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
};

async function handleRequest(request: Request, url: URL): Promise<Response> {
    const cookieJar = new CookieJar(request.headers.get("cookie") ?? "");
    const event: RequestEvent = { request, url, locals: {}, params: {}, cookies: cookieJar };
    const response = userHandle
        ? await userHandle({ event, resolve })
        : await resolve(event);

    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
    // Apply any Set-Cookie headers accumulated during the request
    for (const cookie of cookieJar.outgoing) headers.append("Set-Cookie", cookie);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// ─── Elysia App ───────────────────────────────────────────

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isDev ? 3001 : 3000);

const app = new Elysia()
    .use(staticPlugin({ assets: "public", prefix: "/" }))
    // dist/client is served by our resolve() handler with proper cache headers
    // API routes must intercept all HTTP methods before the GET catch-all
    .onBeforeHandle(async ({ request }) => {
        const url = new URL(request.url);
        if (!findMatch(apiRoutes, url.pathname)) return; // not an API route
        return handleRequest(request, url);
    })
    // SSR pages
    .get("*", ({ request }) => {
        const url = new URL(request.url);
        return handleRequest(request, url);
    })
    // Non-GET catch-alls so onBeforeHandle fires for API routes on other methods
    .post("*", () => new Response("Not Found", { status: 404 }))
    .put("*", () => new Response("Not Found", { status: 404 }))
    .patch("*", () => new Response("Not Found", { status: 404 }))
    .delete("*", () => new Response("Not Found", { status: 404 }))
    .options("*", () => new Response("Not Found", { status: 404 }));

app.listen(PORT, () => {
    // In dev mode the proxy owns port 3000 — don't print the internal port
    if (!isDev) console.log(`🐰 Bunia server running at http://localhost:${PORT}`);
});

export { app };
