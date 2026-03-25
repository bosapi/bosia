import { Elysia } from "elysia";

import { existsSync } from "fs";
import { join, resolve as resolvePath } from "path";

import { findMatch } from "./matcher.ts";
import { apiRoutes, serverRoutes } from "bosbun:routes";
import type { Handle, RequestEvent } from "./hooks.ts";
import { HttpError, Redirect, ActionFailure } from "./errors.ts";
import { CookieJar } from "./cookies.ts";
import { checkCsrf } from "./csrf.ts";
import type { CsrfConfig } from "./csrf.ts";
import { getCorsHeaders, handlePreflight } from "./cors.ts";
import type { CorsConfig } from "./cors.ts";
import { isDev, compress, isStaticPath } from "./html.ts";
import { loadRouteData, renderSSRStream, renderErrorPage, renderPageWithFormData } from "./renderer.ts";
import { getServerTime } from "../lib/utils.ts";

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

// ─── Env Helpers ─────────────────────────────────────────

function splitCsvEnv(key: string): string[] | undefined {
    return process.env[key]?.split(",").map(s => s.trim()).filter(Boolean) || undefined;
}

// ─── CSRF Config ─────────────────────────────────────────

const _csrfAllowedOrigins = splitCsvEnv("CSRF_ALLOWED_ORIGINS");

const CSRF_CONFIG: CsrfConfig = {
    checkOrigin: true,
    allowedOrigins: _csrfAllowedOrigins,
};

if (_csrfAllowedOrigins?.length) {
    console.log(`🛡️  CSRF allowed origins: ${_csrfAllowedOrigins.join(", ")}`);
} else {
    console.log("🛡️  CSRF: same-origin only");
}

// ─── CORS Config ──────────────────────────────────────────

const _corsAllowedOrigins = splitCsvEnv("CORS_ALLOWED_ORIGINS");

const CORS_CONFIG: CorsConfig | null = _corsAllowedOrigins?.length
    ? {
        allowedOrigins: _corsAllowedOrigins,
        allowedMethods: splitCsvEnv("CORS_ALLOWED_METHODS"),
        allowedHeaders: splitCsvEnv("CORS_ALLOWED_HEADERS"),
        exposedHeaders: splitCsvEnv("CORS_EXPOSED_HEADERS"),
        credentials: process.env.CORS_CREDENTIALS === "true" || undefined,
        maxAge: process.env.CORS_MAX_AGE ? parseInt(process.env.CORS_MAX_AGE, 10) : undefined,
    }
    : null;

if (_corsAllowedOrigins?.length) {
    console.log(`🌐 CORS allowed origins: ${_corsAllowedOrigins.join(", ")}`);
}

// ─── Core Request Resolver ────────────────────────────────
// This is the inner handler that hooks wrap around.

function isValidRoutePath(path: string, origin: string): boolean {
    try {
        return new URL(path, origin).origin === origin;
    } catch {
        return false;
    }
}

/** Resolve a file path and verify it stays within the allowed base directory. Returns null if traversal detected. */
function safePath(base: string, untrusted: string): string | null {
    const root = resolvePath(base);
    const full = resolvePath(join(base, untrusted));
    return full.startsWith(root + "/") || full === root ? full : null;
}

/** Extract action name from URL searchParams — `?/login` → "login", no slash key → "default". */
function parseActionName(url: URL): string {
    for (const key of url.searchParams.keys()) {
        if (key.startsWith("/")) return key.slice(1) || "default";
    }
    return "default";
}

async function resolve(event: RequestEvent): Promise<Response> {
    const { request, url, locals, cookies } = event;
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // Health check endpoint — for load balancers and orchestrators
    if (path === "/_health") {
        const { timestamp, timezone } = getServerTime();
        return Response.json({ status: "ok", timestamp, timezone });
    }

    // Data endpoint — returns server loader data as JSON for client-side navigation
    if (path === "/__bosbun/data") {
        const routePath = url.searchParams.get("path") ?? "/";
        if (!isValidRoutePath(routePath, url.origin)) {
            return Response.json({ error: "Invalid path", status: 400 }, { status: 400 });
        }
        const routeUrl = new URL(routePath, url.origin);
        // Rewrite event.url so logging middleware sees the real page path, not /__bosbun/data
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
            if (isDev) console.error("Data endpoint error:", err);
            else console.error("Data endpoint error:", (err as Error).message ?? err);
            return Response.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    // Static files
    if (isStaticPath(path)) {
        // dist/client: serve with cache headers based on whether filename is hashed
        if (path.startsWith("/dist/client/")) {
            const resolved = safePath("./dist/client", path.split("?")[0].slice("/dist/client".length));
            if (resolved) {
                const file = Bun.file(resolved);
                if (await file.exists()) {
                    const filename = path.split("/").pop() ?? "";
                    const isHashed = /\-[a-z0-9]{8,}\.[a-z]+$/.test(filename);
                    const cacheControl = !isDev && isHashed
                        ? "public, max-age=31536000, immutable"
                        : "no-cache";
                    return new Response(file, { headers: { "Cache-Control": cacheControl } });
                }
            }
            return new Response("Not Found", { status: 404 });
        }
        const pubPath = safePath("./public", path);
        if (pubPath) {
            const pub = Bun.file(pubPath);
            if (await pub.exists()) return new Response(pub);
        }
        const distPath = safePath("./dist", path);
        if (distPath) {
            const dist = Bun.file(distPath);
            if (await dist.exists()) return new Response(dist);
        }
        return new Response("Not Found", { status: 404 });
    }

    // Prerendered pages — serve static HTML built at build time
    const prerenderPath = safePath(
        "./dist/prerendered",
        path === "/" ? "index.html" : `${path}/index.html`,
    );
    if (prerenderPath) {
        const prerenderFile = Bun.file(prerenderPath);
        if (await prerenderFile.exists()) {
            return new Response(prerenderFile, {
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "public, max-age=3600",
                },
            });
        }
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
            if (isDev) console.error("API route error:", err);
            else console.error("API route error:", (err as Error).message ?? err);
            return Response.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    // Form actions — POST to page routes with `actions` export
    if (method === "POST") {
        const pageMatch = findMatch(serverRoutes, path);
        if (pageMatch?.route.pageServer) {
            try {
                const mod = await pageMatch.route.pageServer();
                if (mod.actions && typeof mod.actions === "object") {
                    const actionName = parseActionName(url);
                    const action = mod.actions[actionName];
                    if (!action) {
                        return renderErrorPage(404, `Action "${actionName}" not found`, url, request);
                    }

                    event.params = pageMatch.params;
                    let result: any;
                    try {
                        result = await action(event);
                    } catch (err) {
                        if (err instanceof Redirect) {
                            return new Response(null, {
                                status: 303,
                                headers: { Location: err.location },
                            });
                        }
                        if (err instanceof HttpError) {
                            return renderErrorPage(err.status, err.message, url, request);
                        }
                        throw err;
                    }

                    // Redirect returned (not thrown)
                    if (result instanceof Redirect) {
                        return new Response(null, {
                            status: 303,
                            headers: { Location: result.location },
                        });
                    }

                    // ActionFailure — re-render with failure status
                    if (result instanceof ActionFailure) {
                        return renderPageWithFormData(url, locals, request, cookies, result.data, result.status);
                    }

                    // Success — re-render page with action return data
                    return renderPageWithFormData(url, locals, request, cookies, result ?? null, 200);
                }
            } catch (err) {
                if (err instanceof Redirect) {
                    return new Response(null, {
                        status: 303,
                        headers: { Location: err.location },
                    });
                }
                if (err instanceof HttpError) {
                    return renderErrorPage(err.status, err.message, url, request);
                }
                if (isDev) console.error("Form action error:", err);
                else console.error("Form action error:", (err as Error).message ?? err);
                return Response.json({ error: "Internal Server Error" }, { status: 500 });
            }
        }
    }

    // SSR pages (+page.svelte) — streaming by default
    const streamResponse = await renderSSRStream(url, locals, request, cookies);
    if (!streamResponse) return renderErrorPage(404, "Not Found", url, request);
    return streamResponse;
}

// ─── Request Entry ────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
};

async function handleRequest(request: Request, url: URL): Promise<Response> {
    try {
        // Handle CORS preflight before CSRF check (OPTIONS is CSRF-exempt)
        if (CORS_CONFIG && request.method === "OPTIONS") {
            const preflight = handlePreflight(request, CORS_CONFIG);
            if (preflight) return preflight;
        }

        const csrfError = checkCsrf(request, url, CSRF_CONFIG);
        if (csrfError) {
            console.warn(`[CSRF] Blocked request: ${csrfError}`);
            return Response.json({ error: "Forbidden", message: csrfError }, { status: 403 });
        }

        const cookieJar = new CookieJar(request.headers.get("cookie") ?? "");
        const event: RequestEvent = { request, url, locals: {}, params: {}, cookies: cookieJar };
        const response = userHandle
            ? await userHandle({ event, resolve })
            : await resolve(event);

        const headers = new Headers(response.headers);
        for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
        // Apply CORS headers for allowed origins
        if (CORS_CONFIG) {
            const corsHeaders = getCorsHeaders(request, CORS_CONFIG);
            if (corsHeaders) {
                for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
            }
        }
        // Apply any Set-Cookie headers accumulated during the request
        for (const cookie of cookieJar.outgoing) headers.append("Set-Cookie", cookie);
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    } catch (err) {
        if (isDev) console.error("Unhandled request error:", err);
        else console.error("Unhandled request error:", (err as Error).message ?? err);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ─── Body Size Limit ──────────────────────────────────────
// Parsed once at startup from BODY_SIZE_LIMIT env var.
// Format: "512K", "1M", "1G", plain bytes, or "Infinity".
// Default: 512K (matches SvelteKit).

function parseBodySizeLimit(value?: string): number {
    if (!value) return 512 * 1024;
    if (value === "Infinity") return 0; // Bun: 0 = no limit
    const match = value.match(/^(\d+(?:\.\d+)?)\s*([KMG]?)$/i);
    if (!match) throw new Error(`Invalid BODY_SIZE_LIMIT: "${value}"`);
    const num = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === "K") return Math.floor(num * 1024);
    if (unit === "M") return Math.floor(num * 1024 * 1024);
    if (unit === "G") return Math.floor(num * 1024 * 1024 * 1024);
    return Math.floor(num);
}

const BODY_SIZE_LIMIT = parseBodySizeLimit(process.env.BODY_SIZE_LIMIT);

if (BODY_SIZE_LIMIT === 0) {
    console.log("📦 Body size limit: none");
} else {
    console.log(`📦 Body size limit: ${BODY_SIZE_LIMIT} bytes`);
}

// ─── Elysia App ───────────────────────────────────────────

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isDev ? 9001 : 9000);

const app = new Elysia({ serve: { maxRequestBodySize: BODY_SIZE_LIMIT } })
    .onError(({ error }) => {
        if (isDev) console.error("Uncaught server error:", error);
        else console.error("Uncaught server error:", (error as Error)?.message ?? error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    })
    // Static files are served by resolve() with path traversal protection and security headers
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
    .post("*", ({ request }) => {
        const url = new URL(request.url);
        return handleRequest(request, url);
    })
    .put("*", ({ request }) => {
        const url = new URL(request.url);
        return handleRequest(request, url);
    })
    .patch("*", ({ request }) => {
        const url = new URL(request.url);
        return handleRequest(request, url);
    })
    .delete("*", ({ request }) => {
        const url = new URL(request.url);
        return handleRequest(request, url);
    })
    .options("*", ({ request }) => {
        const url = new URL(request.url);
        return handleRequest(request, url);
    });

app.listen(PORT, () => {
    // In dev mode the proxy owns the user-facing port — don't print the internal port
    if (!isDev) console.log(`⬡ Bosbun server running at http://localhost:${PORT}`);
});

function shutdown() {
    console.log("Shutting down...");
    app.stop().then(() => process.exit(0));
    // Force exit if stop hangs
    setTimeout(() => process.exit(1), 10_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export { app };
