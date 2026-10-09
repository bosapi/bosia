import { brotliCompressSync, gzipSync, constants as zlibConstants } from "node:zlib";

import { readArtifact } from "./artifacts.ts";
import { nonceAttr } from "./csp.ts";
import { rebaseHtmlAttrs } from "./basePath.ts";
import { currentBase } from "./appBase.ts";
import type { AppHtmlSegments } from "./appHtml.ts";
import { findHeadEnd, interpolateSegment } from "./appHtml.ts";
import type { Metadata } from "./hooks.ts";

// Workers compresses any body sent with a Content-Encoding header — again, if it
// already is — unless told the bytes are final. Bun ignores the key.
export const PRECOMPRESSED = { encodeBody: "manual" } as ResponseInit;

// ─── Dist Manifest ───────────────────────────────────────
// Maps hashed filenames → script/link tags.
// Cached at startup; server restarts on rebuild in dev anyway.

export const distManifest: {
	js: string[];
	css: string[];
	entry: string;
	tw?: string;
	basePath?: string;
	/** PUBLIC_* (non-static) names declared in .env files, stamped by the build. */
	publicEnv?: string[];
	/** Client chunks per route pattern, stamped by the build (see preloadMap.ts). */
	preload?: Record<string, string[]>;
} = readArtifact("manifest.json") ?? { js: [], css: [], entry: "hydrate.js" };

export const isDev = process.env.NODE_ENV !== "production";
const cacheBust = isDev ? `?v=${Date.now()}` : "";

// Every URL the framework itself emits into the document, prefixed once here so
// mounting under a BASE_PATH is not thirteen separate string edits. All four are
// "" + the original path when no base is set.
const B = currentBase();
const DIST = `${B}/dist/client`;
const TW_CSS = `${B}/bosia-tw.css`;
const FAVICON = `${B}/favicon.svg`;
const SSE = `${B}/__bosia/sse`;

// The client entry, emitted verbatim — never with a `?v=` buster. Split chunks
// import it by bare relative URL (Bun 1.4 keeps shared code in the entry), so a
// query here makes the browser load it twice: two Svelte runtimes, and hydration
// dies with "reading 'call'". The content-hashed name is already the buster.
const ENTRY = `${DIST}/${distManifest.entry}`;

/**
 * Handed to the client bundle so its router strips the same prefix the server
 * added. Emitted before the module script, and omitted entirely at the origin
 * root so a root-mounted app carries no extra bytes.
 */
export function baseScript(nonce?: string): string {
	return B
		? `\n  <script${nonceAttr(nonce)}>window.__BOSIA_BASE__=${JSON.stringify(B)};</script>`
		: "";
}

/** modulepreload links for the chunks `pattern` needs to hydrate, so they
 *  download alongside the entry instead of after it has run. Hashed names, so
 *  no buster (same reason as ENTRY). Unknown pattern or an older dist/ without
 *  the `preload` field → nothing, and the page loads as it did before. */
export function routePreloadLinks(pattern?: string): string {
	const preload = distManifest.preload;
	if (!pattern || !preload) return "";
	let byPattern = preloadLinks.get(preload);
	if (!byPattern) preloadLinks.set(preload, (byPattern = new Map()));
	let links = byPattern.get(pattern);
	if (links === undefined) {
		links = (preload[pattern] ?? [])
			.map((f) => `\n  <link rel="modulepreload" href="${DIST}/${f}">`)
			.join("");
		byPattern.set(pattern, links);
	}
	return links;
}

// One header value per route pattern (plus "" for no pattern), built on first
// use. Bounded by the number of routes.
const linkHeaders = new Map<string, string>();

/**
 * `Link` response header naming the stylesheets and, when the page hydrates,
 * the client entry and the route's chunks. The document lists the same files,
 * but a CDN that sends 103 Early Hints (Cloudflare) reads them off this header
 * and lets the browser start downloading while the loaders still run.
 * Prod only — dev URLs carry a cache buster and nothing sits in front.
 */
export function preloadLinkHeader(pattern: string | undefined, csr: boolean): string | null {
	if (isDev) return null;
	const key = `${csr ? "1" : "0"}${pattern ?? ""}`;
	let value = linkHeaders.get(key);
	if (value === undefined) {
		const tw = distManifest.tw ? `${DIST}/${distManifest.tw}` : TW_CSS;
		const parts = [tw, ...(distManifest.css ?? []).map((f) => `${DIST}/${f}`)].map(
			(href) => `<${href}>; rel=preload; as=style`,
		);
		if (csr) {
			const scripts = [
				ENTRY,
				...(distManifest.preload?.[pattern ?? ""] ?? []).map((f) => `${DIST}/${f}`),
			];
			for (const href of scripts) parts.push(`<${href}>; rel=modulepreload`);
		}
		value = parts.join(", ");
		linkHeaders.set(key, value);
	}
	return value;
}

/** `extra` with the preload `Link` header added — after any `link` a loader set. */
export function withPreloadLink(
	extra: Record<string, string> | undefined,
	pattern: string | undefined,
	csr: boolean,
): Record<string, string> | undefined {
	const link = preloadLinkHeader(pattern, csr);
	if (!link) return extra;
	const own = extra?.["link"];
	return { ...extra, link: own ? `${own}, ${link}` : link };
}

// The head fragments below are the same on every request, so each is built
// once and reused for as long as the manifest field it reads stays the same
// object (tests swap them out).
const preloadLinks = new WeakMap<object, Map<string, string>>();

/** Tailwind stylesheet link. Content-hashed name needs no cache buster — the
 *  hash IS the buster. Fallback keeps older dist/ artifacts (no `tw` field) styled. */
let twLink: { tw: string | undefined; html: string } | null = null;
function twCssLink(): string {
	const tw = distManifest.tw;
	if (!twLink || twLink.tw !== tw) {
		twLink = {
			tw,
			html: tw
				? `<link rel="stylesheet" href="${DIST}/${tw}">`
				: `<link rel="stylesheet" href="${TW_CSS}${cacheBust}">`,
		};
	}
	return twLink.html;
}

/** The build-time component stylesheet (scoped `<style>` blocks, concatenated).
 *  Emitted AFTER `twCssLink()` on every path: these rules used to be appended to
 *  `document.head` at hydration, i.e. last, and the app stylesheets Tailwind
 *  inlines (`tokens.css`, `components.css`) are unlayered, so a tie between them
 *  is settled on source order. Linking before Tailwind would silently flip
 *  which one wins. Each entry carries its own indent and newline, so an app with
 *  no scoped styles at all contributes nothing rather than a blank line. */
let cssLinks: { css: string[] | undefined; html: string } | null = null;
function componentCssLinks(): string {
	const css = distManifest.css;
	if (!cssLinks || cssLinks.css !== css) {
		cssLinks = {
			css,
			html: (css ?? [])
				.map((f: string) => `  <link rel="stylesheet" href="${DIST}/${f}">\n`)
				.join(""),
		};
	}
	return cssLinks.html;
}

/** Inline theme bootstrap — runs before paint to avoid FOUC. theme ∈ light|dark|system (missing = system). */
const THEME_INIT_JS =
	"try{var t=localStorage.getItem('theme');" +
	"document.documentElement.classList.toggle('dark'," +
	"t==='dark'||((t===null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches))}catch(_){}";

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
 * PUBLIC_* (non-static) vars declared in .env files, with their current values.
 * The names come from the build (`distManifest.publicEnv`), never from
 * process.env — system env vars that happen to start with PUBLIC_ don't leak.
 * The server runs as its own process (and on Workers, with no .env on disk),
 * so the names must travel with the build rather than in loadEnv()'s memory.
 */
export function getPublicDynamicEnv(): Record<string, string> {
	const result: Record<string, string> = {};
	for (const key of distManifest.publicEnv ?? []) {
		const value = process.env[key];
		if (value !== undefined) result[key] = value;
	}
	return result;
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
	bodyEndExtras?: string[],
	segments?: AppHtmlSegments,
	metadata?: Metadata | null,
	pattern?: string,
	headExtras?: string[],
	fallbackTitle = DEFAULT_TITLE,
): string {
	// An app writes <a href="/masuk">; under a base the browser has to be handed
	// /sso/masuk or it walks off this app entirely. Only the rendered markup is
	// touched — never the JSON data islands below, whose strings are loader
	// output and would be corrupted by a path rewrite.
	body = rebaseHtmlAttrs(B, body);
	head = rebaseHtmlAttrs(B, head);

	// Metadata goes in before `head`: the first <title> in the document wins, and
	// buildMetadataChunk uses the same order on the streaming path, so both paths
	// pick the same winner.
	const metaTags = rebaseHtmlAttrs(B, metadataTags(metadata ?? null));
	const extras = rebaseHtmlAttrs(B, headExtraTags(headExtras));
	const fallback = titleFallback(segments, metadata, fallbackTitle, extras, head);

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

	const sysScript = ssrFlag || depsScript ? `\n  <script${n}>${ssrFlag}${depsScript}</script>` : "";

	const dataIslands = csr
		? `\n  <script${n} type="application/json" id="__bosia-page-data__">${safeJsonForScript(pageData)}</script>` +
			`\n  <script${n} type="application/json" id="__bosia-layout-data__">${safeJsonForScript(layoutData)}</script>` +
			(formData != null
				? `\n  <script${n} type="application/json" id="__bosia-form-data__">${safeJsonForScript(formData)}</script>`
				: "")
		: "";

	const scripts = csr
		? `${baseScript(nonce)}${envScript}${dataIslands}${sysScript}\n  <script${n} type="module" src="${ENTRY}"></script>`
		: isDev
			? `\n  <script${n}>!function r(){var e=new EventSource("${SSE}");e.addEventListener("reload",()=>location.reload());e.onopen=()=>r._ok||(r._ok=1);e.onerror=()=>{e.close();setTimeout(r,2000)}}()</script>`
			: "";

	const bodyEnd = bodyEndExtras?.length ? "\n  " + bodyEndExtras.join("\n  ") : "";

	// Same hints the streaming shell sends; skipped when no JS runs at all.
	const preloads = csr
		? `  <link rel="modulepreload" href="${ENTRY}">${routePreloadLinks(pattern)}\n`
		: "";

	if (segments) {
		const safeKey = safeLang(lang);
		const headOpenInterpolated = interpolateSegment(segments.headOpen, {
			lang: safeKey,
			nonce,
		});
		const tailInterpolated = interpolateSegment(segments.tail, { nonce });
		const faviconLine = segments.hasCustomFavicon
			? ""
			: `  <link rel="icon" type="image/svg+xml" href="${FAVICON}">\n`;

		return (
			headOpenInterpolated +
			`\n  ${faviconLine}${twCssLink()}\n` +
			componentCssLinks() +
			`  <script${n}>${THEME_INIT_JS}</script>\n` +
			preloads +
			`  ${metaTags}${extras}` +
			closeHead(segments, lateHead(head, fallback), nonce) +
			(body ? "" : `\n${SPINNER}`) +
			`\n  <div id="app">${body}</div>${scripts}${bodyEnd}` +
			tailInterpolated
		);
	}

	return `<!DOCTYPE html>
<html lang="${safeLang(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="${FAVICON}">
${metaTags}${extras}${lateHead(head, fallback)}  ${twCssLink()}
${componentCssLinks()}  <script${n}>${THEME_INIT_JS}</script>
${preloads}</head>
<body>
  <div id="app">${body}</div>${scripts}${bodyEnd}
</body>
</html>`;
}

// ─── Streaming HTML Helpers ──────────────────────────────

/** Chunk 1: everything from <!DOCTYPE> through CSS/modulepreload links (head still open) */
export function buildHtmlShellOpen(
	lang?: string,
	nonce?: string,
	segments?: AppHtmlSegments,
	pattern?: string,
): string {
	const key = safeLang(lang);
	const n = nonceAttr(nonce);
	if (segments) {
		const headOpenInterpolated = interpolateSegment(segments.headOpen, { lang: key, nonce });
		const faviconLine = segments.hasCustomFavicon
			? ""
			: `  <link rel="icon" type="image/svg+xml" href="${FAVICON}">\n`;
		return (
			headOpenInterpolated +
			`\n  ${faviconLine}${twCssLink()}\n` +
			componentCssLinks() +
			`  <script${n}>${THEME_INIT_JS}</script>\n` +
			`  <link rel="modulepreload" href="${ENTRY}">` +
			routePreloadLinks(pattern)
		);
	}

	return (
		`<!DOCTYPE html>\n<html lang="${key}">\n<head>\n` +
		`  <meta charset="UTF-8">\n` +
		`  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
		`  <link rel="icon" type="image/svg+xml" href="${FAVICON}">\n` +
		`  ${twCssLink()}\n` +
		componentCssLinks() +
		`  <script${n}>${THEME_INIT_JS}</script>\n` +
		`  <link rel="modulepreload" href="${ENTRY}">` +
		routePreloadLinks(pattern)
	);
}

const SPINNER =
	`<div id="__bs__"><style>` +
	`:root{--bosia-loading-color:#f73b27}` +
	`#__bs__{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}` +
	`#__bs__ i{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:var(--bosia-loading-color);` +
	`border-radius:50%;animation:__bs__ .8s linear infinite}` +
	`@keyframes __bs__{to{transform:rotate(360deg)}}</style><i></i></div>`;

/** Marks the tags `metadata()` owns, so the client router can replace exactly
 *  these on navigation and leave `headExtras`, the framework's own static tags
 *  and `<svelte:head>` output alone. Read by `client/App.svelte`. */
export const OWNED = "data-bosia-meta";

/** The `metadata()` tags themselves, indented head-ready. Shared by the streaming
 *  path (buildMetadataChunk) and the non-streaming one (buildHtml) so the two
 *  renderers cannot drift on what `metadata()` emits. */
export function metadataTags(metadata: Metadata | null): string {
	if (!metadata) return "";
	let out = "";
	if (metadata.title) out += `  <title>${escapeHtml(metadata.title)}</title>\n`;
	if (metadata.description) {
		out += `  <meta name="description" content="${escapeAttr(metadata.description)}" ${OWNED}>\n`;
	}
	if (metadata.meta) {
		for (const m of metadata.meta) {
			const attrs = m.name
				? `name="${escapeAttr(m.name)}"`
				: `property="${escapeAttr(m.property ?? "")}"`;
			out += `  <meta ${attrs} content="${escapeAttr(m.content)}" ${OWNED}>\n`;
		}
	}
	if (metadata.link) {
		for (const l of metadata.link) {
			let attrs = `rel="${escapeAttr(l.rel)}" href="${escapeAttr(l.href)}"`;
			if (l.hreflang) attrs += ` hreflang="${escapeAttr(l.hreflang)}"`;
			out += `  <link ${attrs} ${OWNED}>\n`;
		}
	}
	return out;
}

/** app.html's headClose with `late` inserted just before its `</head>`, after any
 *  markup the app put after %bosia.head%, so <svelte:head> stays last in <head>
 *  and a page's styles and meta win over app.html's, as they did when it was
 *  injected client-side. No `</head>` in the segment → `late` goes first. */
function closeHead(segments: AppHtmlSegments, late: string, nonce?: string): string {
	const { before, after } = headSplit(segments);
	return (
		(before ? interpolateSegment(before, { nonce }) : "") +
		late +
		interpolateSegment(after, { nonce })
	);
}

type HeadSplit = { before: string; after: string; hasTitle: boolean };

// app.html never changes after it is parsed, so split it and check it for a
// title once per segments object instead of on every render. Kept in memory,
// not in dist/app-html.json, so it can't go stale against headClose.
const headSplits = new WeakMap<AppHtmlSegments, HeadSplit>();

function headSplit(segments: AppHtmlSegments): HeadSplit {
	let split = headSplits.get(segments);
	if (!split) {
		const { headOpen, headClose } = segments;
		const i = findHeadEnd(headClose);
		const before = i < 0 ? "" : headClose.slice(0, i);
		const after = i < 0 ? headClose : headClose.slice(i);
		split = { before, after, hasTitle: hasTitle(headOpen) || hasTitle(before) };
		headSplits.set(segments, split);
	}
	return split;
}

/** Whether a chunk of head markup already sets the document title. Matches a
 *  <title> with attributes too. Ignores one in a comment, an attribute value, a
 *  script or JSON-LD string, <style>, <noscript>, <template>, or an inline <svg>
 *  (which only labels the icon). */
export function hasTitle(html: string): boolean {
	// A single forward scan, not a regex: a lazy `<script…</script>` match retries
	// from every unclosed `<script` and goes quadratic on hostile {@html} output.
	// Each tag is skipped whole, quotes included, so nothing inside an attribute
	// looks like a tag. This is a heuristic, not a full HTML tokenizer.
	let unclosed: Set<string> | undefined;
	let i = 0;
	while ((i = html.indexOf("<", i)) !== -1) {
		if (html.startsWith("<!--", i)) {
			i = commentEnd(html, i);
			if (i === -1) return false; // unclosed comment runs to the end
			continue;
		}
		if (!isAsciiAlpha(html.charCodeAt(i + 1))) {
			i++;
			continue;
		}
		const nameEnd = tagNameEnd(html, i + 1);
		const tagEnd = openTagEnd(html, nameEnd);
		if (tagEnd === -1) return false; // the rest is inside an unfinished tag
		const name = nameEnd - i - 1 <= MAX_NAME ? html.slice(i + 1, nameEnd).toLowerCase() : "";
		if (name === "title") return true;
		i = tagEnd;
		const close = SKIPPED_TAGS.get(name);
		// Only foreign content like <svg/> honors the self-closing slash.
		const selfClosed = name === "svg" && html.charCodeAt(tagEnd - 2) === 47;
		if (!close || selfClosed || unclosed?.has(name)) continue;
		// An opener with no closer is read as a plain tag, and remembered, so
		// later openers of that tag don't search to the end again.
		close.lastIndex = tagEnd;
		const gt = close.exec(html) ? html.indexOf(">", close.lastIndex) : -1;
		if (gt === -1) (unclosed ??= new Set()).add(name);
		else i = gt + 1;
	}
	return false;
}

/** `</tag` followed by whitespace, `/` or `>`; the caller finds the `>` itself,
 *  since a `[^>]*>` here would rescan to the end for every candidate. */
const SKIPPED_TAGS = new Map(
	["script", "style", "noscript", "template", "svg"].map((t) => [
		t,
		new RegExp(`</${t}(?=[\\t\\n\\f\\r />])`, "gi"),
	]),
);

/** Longest tag name hasTitle needs to tell apart; longer names are never sliced. */
const MAX_NAME = Math.max("title".length, ...[...SKIPPED_TAGS.keys()].map((t) => t.length));

/** Index just past the comment opening at `start`, or -1 when it never closes.
 *  `<!-->` and `<!--->` are complete empty comments. */
function commentEnd(html: string, start: number): number {
	if (html.startsWith(">", start + 4)) return start + 5;
	if (html.startsWith("->", start + 4)) return start + 6;
	const end = html.indexOf("-->", start + 4);
	return end === -1 ? -1 : end + 3;
}

/** End of the tag name starting at `start`: the first whitespace, `/` or `>`. */
function tagNameEnd(html: string, start: number): number {
	let j = start;
	while (j < html.length) {
		const c = html.charCodeAt(j);
		if (isHtmlSpace(c) || c === 47 || c === 62) break;
		j++;
	}
	return j;
}

/** Index just past the `>` closing a start tag, skipping quoted attribute
 *  values, or -1 when the tag never closes. */
function openTagEnd(html: string, from: number): number {
	for (let j = from; j < html.length; j++) {
		const c = html.charCodeAt(j);
		if (c === 62) return j + 1;
		if (c !== 61) continue; // `=` starts a value
		do j++;
		while (j < html.length && isHtmlSpace(html.charCodeAt(j)));
		const q = html.charCodeAt(j);
		if (q === 34 || q === 39) {
			j = html.indexOf(html[j]!, j + 1);
			if (j === -1) return -1;
			continue;
		}
		// Unquoted: runs to whitespace or `>`, quotes and `=` included.
		while (j < html.length && !isHtmlSpace(html.charCodeAt(j)) && html.charCodeAt(j) !== 62) j++;
		j--;
	}
	return -1;
}

/** HTML whitespace: tab, LF, FF, CR, space. Not \s, which also matches NBSP. */
function isHtmlSpace(c: number): boolean {
	return c === 32 || c === 9 || c === 10 || c === 12 || c === 13;
}

function isAsciiAlpha(c: number): boolean {
	return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

/** Plugin `head` fragments, one per line, empty ones skipped. */
function headExtraTags(headExtras?: string[]): string {
	let out = "";
	for (const fragment of headExtras ?? []) {
		if (fragment) out += `  ${fragment}\n`;
	}
	return out;
}

/** The title a page gets when nothing else sets one. */
const DEFAULT_TITLE = "Bosia App";

/** `<title>{text}</title>` unless app.html or one of the head parts already
 *  has a title. Shared by buildHtml and buildMetadataChunk so both paths make
 *  the same call; each passes every part it writes into <head> (metadata,
 *  plugin extras, <svelte:head>). */
function titleFallback(
	segments: AppHtmlSegments | undefined,
	metadata: Metadata | null | undefined,
	text: string,
	...parts: string[]
): string {
	if (metadata?.title || (segments && appHtmlHasTitle(segments))) return "";
	return parts.some(hasTitle) ? "" : `<title>${escapeHtml(text)}</title>`;
}

/** Whether app.html sets its own <title> in its head. */
export function appHtmlHasTitle(segments: AppHtmlSegments): boolean {
	return headSplit(segments).hasTitle;
}

/** <svelte:head>, then the fallback title, for the very end of <head>. The
 *  fallback goes last so that if hasTitle ever misses a real <title>, the real
 *  one still comes first and wins; the cost is a spare tag, not a wrong title. */
function lateHead(head: string, fallbackTitle: string): string {
	return (head ? `  ${head}\n` : "") + (fallbackTitle ? `  ${fallbackTitle}\n` : "");
}

export type MetadataChunkOptions = {
	/** Plugin `head` fragments; they go right after the metadata() tags. */
	headExtras?: string[];
	segments?: AppHtmlSegments;
	/** <svelte:head> output; it goes last, just before app.html's </head>. */
	head?: string;
	nonce?: string;
};

/** Chunk 2: metadata tags + close </head> + open <body> + spinner */
export function buildMetadataChunk(
	metadata: Metadata | null,
	{ headExtras, segments, head = "", nonce }: MetadataChunkOptions = {},
): string {
	// `head` goes in the real <head>, not in a script, so crawlers that don't run
	// JS still see JSON-LD, icons and og tags. Same order as buildHtml: metadata,
	// plugin extras, app.html's own head markup, then <svelte:head>.
	const metaTags = metadataTags(metadata);
	const extras = headExtraTags(headExtras);
	const fallbackTitle = titleFallback(segments, metadata, DEFAULT_TITLE, extras, head);
	let out = "\n" + metaTags + extras;
	const late = lateHead(head, fallbackTitle);

	if (segments) {
		out += closeHead(segments, late, nonce) + `\n${SPINNER}`;
	} else {
		out += `${late}</head>\n<body>\n${SPINNER}`;
	}

	// No loader data islands here, so it's safe to rebase wholesale. That picks up
	// an app's own headExtras (a canonical link, an og:image on a local file) and
	// <svelte:head> output, which buildHtml rebases the same way.
	return rebaseHtmlAttrs(B, out);
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
	pageData: any,
	layoutData: any[],
	csr: boolean,
	formData: any = null,
	ssr = true,
	bodyEndExtras?: string[],
	nonce?: string,
	pageDeps: any = null,
	layoutDeps: any[] | null = null,
	segments?: AppHtmlSegments,
): string {
	// Same rebase as buildHtml — the streamed tail carries the identical markup.
	body = rebaseHtmlAttrs(B, body);

	const n = nonceAttr(nonce);
	let out = `<script${n}>document.getElementById('__bs__').remove()</script>`;
	out += `\n<div id="app">${body}</div>`;
	if (csr) {
		out += baseScript(nonce);
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
		out += `\n<script${n} type="module" src="${ENTRY}"></script>`;
	} else if (isDev) {
		out += `\n<script${n}>!function r(){var e=new EventSource("${SSE}");e.addEventListener("reload",()=>location.reload());e.onopen=()=>r._ok||(r._ok=1);e.onerror=()=>{e.close();setTimeout(r,2000)}}()</script>`;
	}
	if (bodyEndExtras?.length) {
		for (const fragment of bodyEndExtras) {
			if (fragment) out += `\n${fragment}`;
		}
	}

	if (segments) {
		const tailInterpolated = interpolateSegment(segments.tail, { nonce });
		out += `\n${tailInterpolated}`;
	} else {
		out += `\n</body>\n</html>`;
	}

	return out;
}

// ─── Gzip Compression ────────────────────────────────────

const GZIP_MIN_BYTES = 2048;

// Off on Workers: Cloudflare's edge compresses responses itself, outside the
// worker's CPU budget. The first brotli call alone cost ~4ms of a 10ms limit.
export let compressionOn = true;
export function disableCompression(): void {
	compressionOn = false;
}

// Shared, stateless — one instance instead of a fresh allocation per response.
const textEncoder = new TextEncoder();

/** Encodings stored ahead of time — cache entries and build-time static files. */
export type StoredEncoding = "br" | "gzip";
export type Encoding = StoredEncoding | "zstd";

/** Best stored encoding the client accepts — brotli over gzip, null for identity.
 *  A substring check, not q-value parsing: no browser sends `br;q=0`. */
export function pickEncoding(accept: string | null): StoredEncoding | null {
	if (!accept) return null;
	if (accept.includes("br")) return "br";
	if (accept.includes("gzip")) return "gzip";
	return null;
}

/** Best encoding for a body compressed on the spot. zstd comes first: at
 *  level 3 it matches brotli q3's size on an HTML page in about half the CPU
 *  (55µs vs 95µs for 7KB). Current Chrome and Firefox send it; everyone else
 *  falls back to `pickEncoding`. */
export function pickRequestEncoding(accept: string | null): Encoding | null {
	if (accept?.includes("zstd")) return "zstd";
	return pickEncoding(accept);
}

// Per-request brotli runs once per response, so it favors speed: q3 is ~2x
// faster than q5 for ~5–25% bigger output. Cached variants are built once and
// served many times, so they take q5. 11 (the default) would block the event
// loop ~17ms per 500KB.
export type Quality = "request" | "cache";
const BROTLI = {
	request: { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 3 } },
	cache: { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } },
};

// Bun's native gzip is ~40% faster than node:zlib's at the same level and
// size. Workers has no `Bun`, but never compresses (see compressionOn).
const hasBun = typeof Bun !== "undefined";

/** The one place runtime compression quality is set — cache.ts builds its
 *  stored variants through here too. gzip keeps zlib's default level. */
export function encodeBytes(
	bytes: Uint8Array,
	enc: Encoding,
	quality: Quality = "request",
): Uint8Array<ArrayBuffer> {
	if (enc === "zstd") return Bun.zstdCompressSync(bytes, { level: 3 }) as Uint8Array<ArrayBuffer>;
	if (enc === "gzip" && hasBun)
		return Bun.gzipSync(bytes as Uint8Array<ArrayBuffer>) as Uint8Array<ArrayBuffer>;
	const out = enc === "br" ? brotliCompressSync(bytes, BROTLI[quality]) : gzipSync(bytes);
	return new Uint8Array(out) as Uint8Array<ArrayBuffer>;
}

export type Encoded = { enc: Encoding; encoded: Uint8Array<ArrayBuffer> };

/** The body this client gets, or null when it goes out uncompressed. */
export function encodeForRequest(
	bytes: Uint8Array<ArrayBuffer>,
	req: Request,
	quality: Quality = "request",
): Encoded | null {
	const accept = req.headers.get("accept-encoding");
	// A cache-quality body is also stored in the cache entry, which only keeps
	// brotli and gzip copies — so it never picks zstd.
	const enc = quality === "cache" ? pickEncoding(accept) : pickRequestEncoding(accept);
	// Skip compression in dev — the dev proxy's fetch() auto-decompresses gzip
	// responses but keeps the Content-Encoding header, causing ERR_CONTENT_DECODING_FAILED.
	if (!compressionOn || isDev || !enc || bytes.length <= GZIP_MIN_BYTES) return null;
	return { enc, encoded: encodeBytes(bytes, enc, quality) };
}

export function compress(
	body: string,
	contentType: string,
	req: Request,
	status = 200,
	extraHeaders?: Record<string, string>,
): Response {
	return compressBytes(textEncoder.encode(body), contentType, req, status, extraHeaders);
}

/** `encoded`: the result of `encodeForRequest` when the caller already has it
 *  (a cache write reuses the same bytes); omitted, it is built here. */
export function compressBytes(
	bytes: Uint8Array<ArrayBuffer>,
	contentType: string,
	req: Request,
	status = 200,
	extraHeaders?: Record<string, string>,
	encoded: Encoded | null = encodeForRequest(bytes, req),
): Response {
	// Base keys lowercased so lowercased extraHeaders (e.g. loader setHeaders)
	// override them instead of getting comma-joined by Headers.
	const headers: Record<string, string> = {
		"content-type": contentType,
		vary: "Accept-Encoding",
		...extraHeaders,
	};
	if (encoded) {
		return new Response(encoded.encoded, {
			...PRECOMPRESSED,
			status,
			headers: { ...headers, "content-encoding": encoded.enc },
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
	".json",
	".webmanifest",
]);

export function isStaticPath(path: string): boolean {
	if (path.startsWith("/dist/") || path.startsWith("/__bosia/")) return true;
	const dot = path.lastIndexOf(".");
	return dot !== -1 && STATIC_EXTS.has(path.slice(dot));
}
