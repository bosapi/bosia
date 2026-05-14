import { existsSync, readFileSync } from "fs";
import { getDeclaredEnvKeys } from "./env.ts";
import { nonceAttr } from "./csp.ts";

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
const cacheBust = isDev ? `?v=${Date.now()}` : "";

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
	let json: string;
	try {
		json = JSON.stringify(data);
	} catch {
		console.error("safeJsonStringify: failed to serialize data (circular reference?)");
		json = "null";
	}
	return json.replace(/[<>&\u2028\u2029]/g, (c) => map[c]);
}

const SCRIPT_HAZARD_RE = /<(\/script|!--)/gi;

/** Escapes JSON for safe embedding inside <script type="application/json"> blocks.
 *  Blocks premature </script> and <!-- (HTML script-data escape state) without
 *  the JS-context overhead of safeJsonStringify. */
export function safeJsonForScript(data: unknown): string {
	let json: string;
	try {
		json = JSON.stringify(data);
	} catch {
		console.error("safeJsonForScript: failed to serialize data (circular reference?)");
		json = "null";
	}
	return json.replace(SCRIPT_HAZARD_RE, "\\u003c$1");
}

// ─── Public Env Injection ─────────────────────────────────

/**
 * Collect PUBLIC_* (non-static) vars that were declared in .env files.
 * Only exposes keys tracked by loadEnv() — never leaks system env vars
 * that happen to start with PUBLIC_.
 */
const _publicDynamicEnv: Record<string, string> = (() => {
	const declared = getDeclaredEnvKeys();
	const result: Record<string, string> = {};
	for (const key of declared) {
		if (key.startsWith("PUBLIC_") && !key.startsWith("PUBLIC_STATIC_")) {
			const value = process.env[key];
			if (value !== undefined) result[key] = value;
		}
	}
	return result;
})();
function getPublicDynamicEnv(): Record<string, string> {
	return _publicDynamicEnv;
}

// ─── Lang Validation ──────────────────────────────────────

const LANG_RE = /^[a-zA-Z0-9-]{1,35}$/;
export function safeLang(lang?: string): string {
	return lang && LANG_RE.test(lang) ? lang : "en";
}

// ─── HTML Builder ─────────────────────────────────────────

export function buildHtml(
	body: string,
	head: string,
	pageData: any,
	layoutData: any[],
	csr = true,
	formData: any = null,
	lang?: string,
	ssr = true,
	nonce?: string,
	pageDeps: any = null,
	layoutDeps: any[] | null = null,
): string {
	const cssLinks = (distManifest.css ?? [])
		.map((f: string) => `<link rel="stylesheet" href="/dist/client/${f}">`)
		.join("\n  ");

	const fallbackTitle = head.includes("<title>") ? "" : "<title>Bosia App</title>";

	const n = nonceAttr(nonce);
	const publicEnv = getPublicDynamicEnv();
	const envScript =
		Object.keys(publicEnv).length > 0
			? `\n  <script${n}>window.__BOSIA_ENV__=${safeJsonStringify(publicEnv)};</script>`
			: "";

	const ssrFlag = ssr ? "" : "window.__BOSIA_SSR__=false;";

	const depsScript =
		pageDeps !== null || layoutDeps !== null
			? `window.__BOSIA_PAGE_DEPS__=${safeJsonStringify(pageDeps)};window.__BOSIA_LAYOUT_DEPS__=${safeJsonStringify(layoutDeps ?? [])};`
			: "";

	const sysScript =
		ssrFlag || depsScript ? `\n  <script${n}>${ssrFlag}${depsScript}</script>` : "";

	const dataIslands = csr
		? `\n  <script${n} type="application/json" id="__bosia-page-data__">${safeJsonForScript(pageData)}</script>` +
			`\n  <script${n} type="application/json" id="__bosia-layout-data__">${safeJsonForScript(layoutData)}</script>` +
			(formData != null
				? `\n  <script${n} type="application/json" id="__bosia-form-data__">${safeJsonForScript(formData)}</script>`
				: "")
		: "";

	const scripts = csr
		? `${envScript}${dataIslands}${sysScript}\n  <script${n} type="module" src="/dist/client/${distManifest.entry}${cacheBust}"></script>`
		: isDev
			? `\n  <script${n}>!function r(){var e=new EventSource("/__bosia/sse");e.addEventListener("reload",()=>location.reload());e.onopen=()=>r._ok||(r._ok=1);e.onerror=()=>{e.close();setTimeout(r,2000)}}()</script>`
			: "";

	return `<!DOCTYPE html>
<html lang="${safeLang(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${fallbackTitle}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${head}
  ${cssLinks}
  <link rel="stylesheet" href="/bosia-tw.css${cacheBust}">
  <script${n}>try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(_){}</script>
</head>
<body>
  <div id="app">${body}</div>${scripts}
</body>
</html>`;
}

// ─── Streaming HTML Helpers ──────────────────────────────

import type { Metadata } from "./hooks.ts";

/** Chunk 1: everything from <!DOCTYPE> through CSS/modulepreload links (head still open) */
export function buildHtmlShellOpen(lang?: string, nonce?: string): string {
	const key = safeLang(lang);
	const n = nonceAttr(nonce);
	const cssLinks = (distManifest.css ?? [])
		.map((f: string) => `<link rel="stylesheet" href="/dist/client/${f}">`)
		.join("\n  ");
	return (
		`<!DOCTYPE html>\n<html lang="${key}">\n<head>\n` +
		`  <meta charset="UTF-8">\n` +
		`  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
		`  <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n` +
		`  ${cssLinks}\n` +
		`  <link rel="stylesheet" href="/bosia-tw.css${cacheBust}">\n` +
		`  <script${n}>try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(_){}</script>\n` +
		`  <link rel="modulepreload" href="/dist/client/${distManifest.entry}${cacheBust}">`
	);
}

const SPINNER =
	`<div id="__bs__"><style>` +
	`:root{--bosia-loading-color:#f73b27}` +
	`#__bs__{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}` +
	`#__bs__ i{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:var(--bosia-loading-color);` +
	`border-radius:50%;animation:__bs__ .8s linear infinite}` +
	`@keyframes __bs__{to{transform:rotate(360deg)}}</style><i></i></div>`;

/** Chunk 2: metadata tags + close </head> + open <body> + spinner */
export function buildMetadataChunk(metadata: Metadata | null, headExtras?: string[]): string {
	let out = "\n";
	if (metadata) {
		if (metadata.title) out += `  <title>${escapeHtml(metadata.title)}</title>\n`;
		if (metadata.description) {
			out += `  <meta name="description" content="${escapeAttr(metadata.description)}">\n`;
		}
		if (metadata.meta) {
			for (const m of metadata.meta) {
				const attrs = m.name
					? `name="${escapeAttr(m.name)}"`
					: `property="${escapeAttr(m.property ?? "")}"`;
				out += `  <meta ${attrs} content="${escapeAttr(m.content)}">\n`;
			}
		}
		if (metadata.link) {
			for (const l of metadata.link) {
				let attrs = `rel="${escapeAttr(l.rel)}" href="${escapeAttr(l.href)}"`;
				if (l.hreflang) attrs += ` hreflang="${escapeAttr(l.hreflang)}"`;
				out += `  <link ${attrs}>\n`;
			}
		}
	} else {
		out += `  <title>Bosia App</title>\n`;
	}
	if (headExtras?.length) {
		for (const fragment of headExtras) {
			if (fragment) out += `  ${fragment}\n`;
		}
	}
	out += `</head>\n<body>\n${SPINNER}`;
	return out;
}

export function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export function buildHtmlTail(
	body: string,
	head: string,
	pageData: any,
	layoutData: any[],
	csr: boolean,
	formData: any = null,
	ssr = true,
	bodyEndExtras?: string[],
	nonce?: string,
	pageDeps: any = null,
	layoutDeps: any[] | null = null,
): string {
	const n = nonceAttr(nonce);
	let out = `<script${n}>document.getElementById('__bs__').remove()</script>`;
	out += `\n<div id="app">${body}</div>`;
	if (head)
		out += `\n<script${n}>document.head.insertAdjacentHTML('beforeend',${safeJsonStringify(head)})</script>`;
	if (csr) {
		const publicEnv = getPublicDynamicEnv();
		if (Object.keys(publicEnv).length > 0) {
			out += `\n<script${n}>window.__BOSIA_ENV__=${safeJsonStringify(publicEnv)};</script>`;
		}
		out += `\n<script${n} type="application/json" id="__bosia-page-data__">${safeJsonForScript(pageData)}</script>`;
		out += `\n<script${n} type="application/json" id="__bosia-layout-data__">${safeJsonForScript(layoutData)}</script>`;
		if (formData != null) {
			out += `\n<script${n} type="application/json" id="__bosia-form-data__">${safeJsonForScript(formData)}</script>`;
		}
		const ssrFlag = ssr ? "" : "window.__BOSIA_SSR__=false;";
		const depsInject =
			pageDeps !== null || layoutDeps !== null
				? `window.__BOSIA_PAGE_DEPS__=${safeJsonStringify(pageDeps)};window.__BOSIA_LAYOUT_DEPS__=${safeJsonStringify(layoutDeps ?? [])};`
				: "";
		if (ssrFlag || depsInject) {
			out += `\n<script${n}>${ssrFlag}${depsInject}</script>`;
		}
		out += `\n<script${n} type="module" src="/dist/client/${distManifest.entry}${cacheBust}"></script>`;
	} else if (isDev) {
		out += `\n<script${n}>!function r(){var e=new EventSource("/__bosia/sse");e.addEventListener("reload",()=>location.reload());e.onopen=()=>r._ok||(r._ok=1);e.onerror=()=>{e.close();setTimeout(r,2000)}}()</script>`;
	}
	if (bodyEndExtras?.length) {
		for (const fragment of bodyEndExtras) {
			if (fragment) out += `\n${fragment}`;
		}
	}
	out += `\n</body>\n</html>`;
	return out;
}

// ─── Gzip Compression ────────────────────────────────────

const GZIP_MIN_BYTES = 2048;

export function compress(
	body: string,
	contentType: string,
	req: Request,
	status = 200,
	extraHeaders?: Record<string, string>,
): Response {
	const headers: Record<string, string> = {
		"Content-Type": contentType,
		Vary: "Accept-Encoding",
		...extraHeaders,
	};
	const accept = req.headers.get("accept-encoding") ?? "";
	const bytes = new TextEncoder().encode(body);
	// Skip compression in dev — the dev proxy's fetch() auto-decompresses gzip
	// responses but keeps the Content-Encoding header, causing ERR_CONTENT_DECODING_FAILED.
	if (!isDev && bytes.length > GZIP_MIN_BYTES && accept.includes("gzip")) {
		return new Response(Bun.gzipSync(bytes), {
			status,
			headers: { ...headers, "Content-Encoding": "gzip" },
		});
	}
	return new Response(bytes, { status, headers });
}

// ─── Static File Detection ────────────────────────────────

const STATIC_EXTS = new Set([
	".ico",
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".svg",
	".css",
	".js",
	".woff",
	".woff2",
	".ttf",
	".xml",
	".txt",
]);

export function isStaticPath(path: string): boolean {
	if (path.startsWith("/dist/") || path.startsWith("/__bosia/")) return true;
	const dot = path.lastIndexOf(".");
	return dot !== -1 && STATIC_EXTS.has(path.slice(dot));
}
