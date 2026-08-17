// Mounting an app under a URL prefix — `BASE_PATH=/sso` serves the whole app
// from https://host/sso/… instead of the origin root.
//
// Env-free and pure on purpose. The server reads `process.env.BASE_PATH`, the
// browser reads `window.__BOSIA_BASE__`, and both call these same functions, so
// the two halves of the router cannot drift apart. That matters more than it
// looks: a mismatch means the server renders a page the client router then
// fails to match, and the app hydrates into a blank screen.

/** `""` for a root-mounted app, else a leading slash and no trailing one. */
export function normalizeBase(raw: string | null | undefined): string {
	const trimmed = (raw ?? "").trim().replace(/\/+$/, "");
	if (!trimmed || trimmed === "/") return "";
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Prefix a root-absolute in-app path. Everything else is returned untouched — a
 * full URL, a protocol-relative `//host`, a relative path, and a path already
 * under the base, which makes this safe to apply twice.
 *
 * The last clause needs the `/` in `${base}/`: without it a base of `/sso` would
 * swallow a sibling route `/sso-admin`. It does mean an app mounted at `/sso`
 * that also has its own `/sso/…` route gets left alone — pathological, and the
 * alternative is a prefix that is not idempotent.
 */
export function withBase(base: string, path: string): string {
	if (!base || !path.startsWith("/") || path.startsWith("//")) return path;
	if (path === base || path.startsWith(`${base}/`)) return path;
	return base + path;
}

/**
 * The in-app pathname for an incoming request, or `null` when the request is
 * not ours to answer. `/sso` and `/sso/` both resolve to `/` so the root route
 * is reachable with or without the trailing slash.
 */
export function stripBase(base: string, pathname: string): string | null {
	if (!base) return pathname;
	if (pathname === base) return "/";
	if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
	return null;
}

// Root-absolute URLs in the attributes a browser resolves against the origin.
// `(?!\/)` keeps protocol-relative `//host` out of it.
const ROOT_ABSOLUTE_ATTR = /\b(href|src|action|formaction)=("|')(\/(?!\/)[^"']*)\2/gi;

// CSS `url(/…)`, which reaches the origin exactly like an href does. Lives in
// `style` attributes (where the quotes arrive HTML-escaped as `&quot;`) and in
// `<style>` blocks. A mask-image that silently 404s is a blank icon, not an
// error, so this one is easy to miss.
const CSS_URL_ROOT = /(url\(\s*(?:&quot;|&#39;|&apos;|["'])?)(\/(?!\/)[^)"'&\s]*)/gi;

/**
 * Rewrite root-absolute `href`/`src`/`action` in rendered markup so an app that
 * writes `<a href="/masuk">` keeps working under a base with no code change.
 *
 * Only ever called on the SSR'd body and head, never on the JSON data islands —
 * those carry loader output, and a blind rewrite there would corrupt any string
 * that merely looked like a path.
 *
 * Does not touch `srcset` — comma-separated candidates with descriptors, and
 * nothing in the framework emits one root-absolute. An app that does needs
 * `base` from "bosia".
 */
export function rebaseHtmlAttrs(base: string, html: string): string {
	if (!base) return html;
	return rebaseCssUrls(
		base,
		html.replace(
			ROOT_ABSOLUTE_ATTR,
			(_match, attr: string, quote: string, path: string) =>
				`${attr}=${quote}${withBase(base, path)}${quote}`,
		),
	);
}

/**
 * The same `url(/…)` rewrite for a standalone stylesheet.
 *
 * A `@font-face` src or a `mask-image` inside a compiled .css file is out of
 * reach of any markup rewrite — the browser resolves it against the origin, and
 * a miss is silent: the wrong font renders, an icon is simply blank. Applied at
 * build time, which is why a build and the server that runs it must agree on
 * BASE_PATH.
 */
export function rebaseCssUrls(base: string, css: string): string {
	if (!base) return css;
	return css.replace(
		CSS_URL_ROOT,
		(_match, open: string, path: string) => `${open}${withBase(base, path)}`,
	);
}
