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

// ─── HTML Builder ─────────────────────────────────────────

export function buildHtml(
    body: string,
    head: string,
    pageData: any,
    layoutData: any[],
    csr = true,
): string {
    const cacheBust = isDev ? `?v=${Date.now()}` : "";

    const cssLinks = (distManifest.css ?? [])
        .map((f: string) => `<link rel="stylesheet" href="/dist/client/${f}">`)
        .join("\n  ");

    const fallbackTitle = head.includes("<title>") ? "" : "<title>Bunia App</title>";

    const scripts = csr
        ? `\n  <script>window.__BUNIA_PAGE_DATA__=${JSON.stringify(pageData)};window.__BUNIA_LAYOUT_DATA__=${JSON.stringify(layoutData)};</script>\n  <script type="module" src="/dist/client/${distManifest.entry}${cacheBust}"></script>`
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
