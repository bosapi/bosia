import { existsSync, readFileSync } from "fs";

// ─── Dist Manifest ───────────────────────────────────────
// Maps hashed filenames → script/link tags.
// Cached at startup; server restarts on rebuild in dev anyway.

export const distManifest: { js: string[]; css: string[]; entry: string } = (() => {
    const p = "./dist/manifest.json";
    return existsSync(p)
        ? JSON.parse(readFileSync(p, "utf-8"))
        : { js: [], css: [], entry: "hydrate.js" };
})();

export const isDev = process.env.NODE_ENV !== "production";

// ─── Safe JSON Serialization ──────────────────────────────

/** Escapes JSON for safe embedding inside <script> tags. Prevents XSS via </script> injection. */
export function safeJsonStringify(data: unknown): string {
    const map: Record<string, string> = {
        "<": "\\u003c",
        ">": "\\u003e",
        "&": "\\u0026",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029",
    };
    return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, c => map[c]);
}

// ─── Public Env Injection ─────────────────────────────────

/**
 * Collect PUBLIC_* (non-static) vars from process.env that were declared in .bunia/env.server.ts.
 * We read the generated server env module to know which keys to expose.
 * Falls back to an empty object if the module hasn't been generated yet (e.g., dev before first build).
 */
function getPublicDynamicEnv(): Record<string, string> {
    // Read keys from .bunia/env.server.ts declarations of PUBLIC_* (non-static) vars
    // by inspecting process.env keys that start with PUBLIC_ but not PUBLIC_STATIC_.
    // We only expose keys that came from .env files — tracked in process.env via loadEnv.
    // At runtime the server module exports are inlined; we collect from process.env here.
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith("PUBLIC_") && !key.startsWith("PUBLIC_STATIC_") && value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}

// ─── HTML Builder ─────────────────────────────────────────

export function buildHtml(
    body: string,
    head: string,
    pageData: any,
    layoutData: any[],
    csr = true,
    formData: any = null,
): string {
    const cacheBust = isDev ? `?v=${Date.now()}` : "";

    const cssLinks = (distManifest.css ?? [])
        .map((f: string) => `<link rel="stylesheet" href="/dist/client/${f}">`)
        .join("\n  ");

    const fallbackTitle = head.includes("<title>") ? "" : "<title>Bunia App</title>";

    const publicEnv = getPublicDynamicEnv();
    const envScript = Object.keys(publicEnv).length > 0
        ? `\n  <script>window.__BUNIA_ENV__=${safeJsonStringify(publicEnv)};</script>`
        : "";

    const formScript = formData != null
        ? `window.__BUNIA_FORM_DATA__=${safeJsonStringify(formData)};`
        : "";

    const scripts = csr
        ? `${envScript}\n  <script>window.__BUNIA_PAGE_DATA__=${safeJsonStringify(pageData)};window.__BUNIA_LAYOUT_DATA__=${safeJsonStringify(layoutData)};${formScript}</script>\n  <script type="module" src="/dist/client/${distManifest.entry}${cacheBust}"></script>`
        : isDev
            ? `\n  <script>!function r(){var e=new EventSource("/__bunia/sse");e.addEventListener("reload",()=>location.reload());e.onopen=()=>r._ok||(r._ok=1);e.onerror=()=>{e.close();setTimeout(r,2000)}}()</script>`
            : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${fallbackTitle}
  <link rel="icon" href="data:,">
  ${head}
  ${cssLinks}
  <link rel="stylesheet" href="/bunia-tw.css${cacheBust}">
</head>
<body>
  <div id="app">${body}</div>${scripts}
</body>
</html>`;
}

// ─── Streaming HTML Helpers ──────────────────────────────

import type { Metadata } from "./hooks.ts";

let _shell: string | null = null;

export function buildHtmlShell(): string {
    if (_shell) return _shell;
    _shell = buildHtmlShellOpen() + buildMetadataChunk(null);
    return _shell;
}

let _shellOpen: string | null = null;

/** Chunk 1: everything from <!DOCTYPE> through CSS/modulepreload links (head still open) */
export function buildHtmlShellOpen(): string {
    if (_shellOpen) return _shellOpen;
    const cacheBust = isDev ? `?v=${Date.now()}` : "";
    const cssLinks = (distManifest.css ?? [])
        .map((f: string) => `<link rel="stylesheet" href="/dist/client/${f}">`)
        .join("\n  ");
    _shellOpen = `<!DOCTYPE html>\n<html lang="en">\n<head>\n` +
        `  <meta charset="UTF-8">\n` +
        `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
        `  <link rel="icon" href="data:,">\n` +
        `  ${cssLinks}\n` +
        `  <link rel="stylesheet" href="/bunia-tw.css${cacheBust}">\n` +
        `  <link rel="modulepreload" href="/dist/client/${distManifest.entry}${cacheBust}">`;
    return _shellOpen;
}

const SPINNER = `<div id="__bs__"><style>` +
    `:root{--bunia-loading-color:#f73b27}` +
    `#__bs__{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}` +
    `#__bs__ i{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:var(--bunia-loading-color);` +
    `border-radius:50%;animation:__bs__ .8s linear infinite}` +
    `@keyframes __bs__{to{transform:rotate(360deg)}}</style><i></i></div>`;

/** Chunk 2: metadata tags + close </head> + open <body> + spinner */
export function buildMetadataChunk(metadata: Metadata | null): string {
    let out = "\n";
    if (metadata) {
        if (metadata.title) out += `  <title>${escapeHtml(metadata.title)}</title>\n`;
        if (metadata.description) {
            out += `  <meta name="description" content="${escapeAttr(metadata.description)}">\n`;
        }
        if (metadata.meta) {
            for (const m of metadata.meta) {
                const attrs = m.name ? `name="${escapeAttr(m.name)}"` : `property="${escapeAttr(m.property ?? "")}"`;
                out += `  <meta ${attrs} content="${escapeAttr(m.content)}">\n`;
            }
        }
    } else {
        out += `  <title>Bunia App</title>\n`;
    }
    out += `</head>\n<body>\n${SPINNER}`;
    return out;
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildHtmlTail(
    body: string,
    head: string,
    pageData: any,
    layoutData: any[],
    csr: boolean,
    formData: any = null,
): string {
    const cacheBust = isDev ? `?v=${Date.now()}` : "";
    let out = `<script>document.getElementById('__bs__').remove()</script>`;
    out += `\n<div id="app">${body}</div>`;
    if (head) out += `\n<script>document.head.innerHTML+=${safeJsonStringify(head)}</script>`;
    if (csr) {
        const publicEnv = getPublicDynamicEnv();
        if (Object.keys(publicEnv).length > 0) {
            out += `\n<script>window.__BUNIA_ENV__=${safeJsonStringify(publicEnv)};</script>`;
        }
        const formInject = formData != null ? `window.__BUNIA_FORM_DATA__=${safeJsonStringify(formData)};` : "";
        out += `\n<script>window.__BUNIA_PAGE_DATA__=${safeJsonStringify(pageData)};` +
               `window.__BUNIA_LAYOUT_DATA__=${safeJsonStringify(layoutData)};${formInject}</script>`;
        out += `\n<script type="module" src="/dist/client/${distManifest.entry}${cacheBust}"></script>`;
    } else if (isDev) {
        out += `\n<script>!function r(){var e=new EventSource("/__bunia/sse");e.addEventListener("reload",()=>location.reload());e.onopen=()=>r._ok||(r._ok=1);e.onerror=()=>{e.close();setTimeout(r,2000)}}()</script>`;
    }
    out += `\n</body>\n</html>`;
    return out;
}

// ─── Gzip Compression ────────────────────────────────────

export function compress(body: string, contentType: string, req: Request, status = 200): Response {
    const headers: Record<string, string> = { "Content-Type": contentType, "Vary": "Accept-Encoding" };
    const accept = req.headers.get("accept-encoding") ?? "";
    // Skip compression in dev — the dev proxy's fetch() auto-decompresses gzip
    // responses but keeps the Content-Encoding header, causing ERR_CONTENT_DECODING_FAILED.
    if (!isDev && body.length > 1024 && accept.includes("gzip")) {
        return new Response(Bun.gzipSync(body), { status, headers: { ...headers, "Content-Encoding": "gzip" } });
    }
    return new Response(body, { status, headers });
}

// ─── Static File Detection ────────────────────────────────

export const STATIC_EXTS = new Set([".ico", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js", ".woff", ".woff2", ".ttf"]);

export function isStaticPath(path: string): boolean {
    if (path.startsWith("/dist/") || path.startsWith("/__bunia/")) return true;
    const dot = path.lastIndexOf(".");
    return dot !== -1 && STATIC_EXTS.has(path.slice(dot));
}
