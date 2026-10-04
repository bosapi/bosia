// ─── Link Prefetching ─────────────────────────────────────
// Supports `data-bosia-preload="hover"` and `data-bosia-preload="viewport"`
// on <a> elements or their ancestors.

import { findMatch } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";
import { appState } from "./appState.svelte.ts";
import { liveContext, shouldRerun } from "./loaderCache.ts";
import { base } from "./base.ts";

/**
 * Build the `_invalidated` mask bits for a target path using the current
 * client loader cache. Char 0 = page, char i+1 = layout depth i; '1' = send,
 * '0' = the client already holds it (the server still runs layout loaders,
 * since they may be guards). Returns `null` when the route cannot be matched.
 */
export function buildMaskBits(path: string): string | null {
	const url = new URL(path, window.location.origin);
	const pathname = url.pathname;
	const match = findMatch(clientRoutes, pathname);
	// Prerendered data is a fixed file: nothing to skip, and on Workers only a
	// plain GET reaches it (the asset server answers a POST with 405).
	if (!match || match.route.prerender) return null;
	const ctx = liveContext(pathname, match.params, url);
	const layoutIds = (match.route as any).layoutIds as (string | null)[];
	const pageId = (match.route as any).pageId as string | null;

	const layoutRunFlags = layoutIds.map((id) => {
		if (id === null) return false;
		const entry = appState.loaderCache.layouts[id];
		if (!entry) return true;
		return shouldRerun(entry, appState.dirty, ctx);
	});

	let pageRun = false;
	if (pageId !== null) {
		const entry = appState.loaderCache.page;
		if (!entry || entry.nodeId !== pageId) pageRun = true;
		else pageRun = shouldRerun(entry, appState.dirty, ctx);
	}

	return (pageRun ? "1" : "0") + layoutRunFlags.map((b) => (b ? "1" : "0")).join("");
}

/**
 * Builds the `/__bosia/data/…` URL for a given client path. `fresh` marks a
 * fetch that follows an `invalidate()`, so the server skips its cached copy.
 */
export function dataUrl(path: string, invalidatedBits?: string, fresh = false): string {
	const url = new URL(path, window.location.origin);
	let p = url.pathname.replace(/\/$/, "");
	let qs = url.search;
	if (invalidatedBits) {
		const sep = qs ? "&" : "?";
		qs = `${qs}${sep}_invalidated=${invalidatedBits}`;
	}
	if (fresh) qs = `${qs}${qs ? "&" : "?"}_fresh=1`;
	// The one place a path is still taken apart, and it is URL construction rather
	// than navigation: the data endpoint is `<base>/__bosia/data` + the *app* path,
	// so the mount prefix moves from the front of the route to the front of the
	// endpoint. Nothing the user sees passes through here.
	if (base && (p === base || p.startsWith(`${base}/`))) p = p.slice(base.length);
	return `${base}/__bosia/data${p || "/index"}.json${qs}`;
}

/** True when the body is JSON we can parse — not a redirect target's HTML. */
function isJsonResponse(res: Response): boolean {
	return (res.headers.get("content-type") ?? "").includes("application/json");
}

/**
 * Read a `/__bosia/data/…` response into the payload the router consumes.
 *
 * Anything that is not JSON used to collapse to `null`, and `null` means "the
 * loader crashed" one branch later — so a hook redirecting an unauthenticated
 * visitor to /login rendered a 500 that no server ever sent. The response says
 * exactly what happened; this reads it instead of discarding it.
 */
export async function readDataResponse(res: Response): Promise<any> {
	// `fetch` follows redirects, so a hook's 303 arrives as the login page's HTML
	// at status 200. `redirected` is the only surviving trace of the redirect.
	if (res.redirected) {
		const target = new URL(res.url, window.location.origin);
		return {
			redirect:
				target.origin === window.location.origin
					? target.pathname + target.search + target.hash
					: target.href,
		};
	}
	if (isJsonResponse(res)) {
		try {
			return await res.json();
		} catch {
			// Claimed JSON, wasn't — a truncated or proxy-mangled body.
			return { error: { status: errorStatus(res), message: errorMessage(res) } };
		}
	}
	// A non-JSON body the router can't use: a hook answering with text/plain 404,
	// an HTML error page from a proxy. Report the status the server actually sent.
	return { error: { status: errorStatus(res), message: errorMessage(res) } };
}

function errorStatus(res: Response): number {
	return res.status >= 400 ? res.status : 500;
}

function errorMessage(res: Response): string {
	return res.statusText || "Internal Server Error";
}

export const prefetchCache = new Map<string, { data: any; ts: number }>();
const MAX_PREFETCH_ENTRIES = 50;

// In-flight fetch deduplication
const pending = new Set<string>();

/** Returns cached prefetch data for a path and removes it from cache. */
export function consumePrefetch(path: string): any | null {
	const entry = prefetchCache.get(path);
	if (entry === undefined) return null;
	prefetchCache.delete(path);
	if (Date.now() - entry.ts > 30_000) return null;
	return entry.data;
}

/** Prefetches data for a path and stores in cache. No-op if already cached/in-flight. */
export async function prefetchPath(path: string): Promise<void> {
	// Nothing to fetch for the page we're on. A click also focuses its link, so
	// the focusin trigger fires ~100ms after the navigation it belongs to.
	if (path === window.location.pathname + window.location.search) return;
	// Warm the route's +loading.svelte chunk alongside its data, so the skeleton
	// paints instantly on click instead of cold-importing after the old page lingers.
	const warmMatch = findMatch(clientRoutes, new URL(path, window.location.origin).pathname);
	// Also warm the page and layout chunks: a route not visited yet otherwise
	// downloads its code only after the click. Errors are swallowed — a stale
	// chunk is the click's to report, not the hover's (hydrate.ts reloads on it).
	if (warmMatch) {
		const route = warmMatch.route as typeof warmMatch.route & {
			loading?: (() => Promise<unknown>) | null;
		};
		for (const load of [route.loading, route.page, ...route.layouts]) {
			load?.().catch(() => {});
		}
	}

	const existing = prefetchCache.get(path);
	if (existing && Date.now() - existing.ts <= 30_000) return;
	if (existing) prefetchCache.delete(path);
	if (pending.has(path)) return;

	// A route without server data never fetches on click either.
	if (!warmMatch?.route.hasServerData) return;

	pending.add(path);
	try {
		// Send the same mask as a real client nav would so the server leaves out
		// layers the client already holds. Falls back to sending everything when
		// the route can't be matched (e.g. external/unknown URL).
		const maskBits = buildMaskBits(path) ?? undefined;
		const res = await fetch(dataUrl(path, maskBits));
		// `ok` alone would cache a guard's login page (200 after the redirect was
		// followed) as if it were this route's data.
		if (res.ok && !res.redirected && isJsonResponse(res)) {
			if (prefetchCache.size >= MAX_PREFETCH_ENTRIES) {
				const oldest = prefetchCache.keys().next().value;
				if (oldest !== undefined) prefetchCache.delete(oldest);
			}
			prefetchCache.set(path, { data: await res.json(), ts: Date.now() });
		}
	} catch {
		// Silently ignore — prefetch is best-effort
	} finally {
		pending.delete(path);
	}
}

function getLinkHref(anchor: HTMLAnchorElement): string | null {
	if (anchor.origin !== window.location.origin) return null;
	if (anchor.target) return null;
	if (anchor.hasAttribute("download")) return null;
	return anchor.pathname + anchor.search;
}

function observeViewportLinks(container: Element | Document = document) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const anchor = entry.target as HTMLAnchorElement;
				const href = getLinkHref(anchor);
				if (href) prefetchPath(href);
				observer.unobserve(anchor);
			}
		},
		{ rootMargin: "0px" },
	);

	const links = (
		container === document ? document : (container as Element)
	).querySelectorAll<HTMLAnchorElement>("a[data-bosia-preload='viewport']");

	for (const link of links) {
		observer.observe(link);
	}

	return observer;
}

/** The link a hover/touch/focus event is on, when it sits under `data-bosia-preload="hover"`. */
function hoverLinkHref(target: EventTarget | null): string | null {
	if (!(target instanceof Element)) return null;
	// Early exit: skip if no [data-bosia-preload="hover"] ancestor exists
	const preloadEl = target.closest("[data-bosia-preload]");
	if (!preloadEl || preloadEl.getAttribute("data-bosia-preload") !== "hover") return null;
	const anchor = target.closest("a") as HTMLAnchorElement | null;
	return anchor ? getLinkHref(anchor) : null;
}

export function initPrefetch(): void {
	// ── Hover strategy (event delegation, 100ms debounce) ────
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;

	const onIntent = (e: Event) => {
		const href = hoverLinkHref(e.target);
		if (!href) return;
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => prefetchPath(href), 100);
	};
	document.addEventListener("mouseover", onIntent);
	// Keyboard users tab onto a link before pressing Enter — same signal.
	document.addEventListener("focusin", onIntent);
	// Touch screens have no hover; a touch is followed by the click within
	// ~100ms or not at all, so start right away instead of debouncing.
	document.addEventListener(
		"touchstart",
		(e) => {
			const href = hoverLinkHref(e.target);
			if (href) prefetchPath(href);
		},
		{ passive: true },
	);

	document.addEventListener("mouseout", () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	});

	// ── Viewport strategy ─────────────────────────────────────
	const observer = observeViewportLinks();

	// Pick up links added after initial render (e.g., after client navigation)
	const mutation = new MutationObserver((records) => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (!(node instanceof Element)) continue;
				// The node itself might be a viewport link
				if (node.matches("a[data-bosia-preload='viewport']")) {
					observer.observe(node as HTMLAnchorElement);
				}
				// Or it might contain viewport links
				for (const link of node.querySelectorAll<HTMLAnchorElement>(
					"a[data-bosia-preload='viewport']",
				)) {
					observer.observe(link);
				}
			}
		}
	});

	mutation.observe(document.body, { childList: true, subtree: true });
}
