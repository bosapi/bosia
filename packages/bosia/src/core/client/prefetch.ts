// ─── Link Prefetching ─────────────────────────────────────
// Supports `data-bosia-preload="hover"` and `data-bosia-preload="viewport"`
// on <a> elements or their ancestors.

import { findMatch } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";
import { appState } from "./appState.svelte.ts";
import { liveContext, shouldRerun } from "./loaderCache.ts";

/**
 * Build the `_invalidated` mask bits for a target path using the current
 * client loader cache. Char 0 = page, char i+1 = layout depth i; '1' = run,
 * '0' = skip. Returns `null` when the route cannot be matched.
 */
export function buildMaskBits(path: string): string | null {
	const url = new URL(path, window.location.origin);
	const pathname = url.pathname;
	const match = findMatch(clientRoutes, pathname);
	if (!match) return null;
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
 * Build `parentSnapshots` (layout depth → cached data) for a target path from
 * the current loader cache, given the mask bits from `buildMaskBits`. For each
 * layout depth whose mask bit is '0' (skipped) and whose cached entry exists,
 * forward that layer's data so server-side downstream loaders see real
 * `parent()` data instead of `{}`. Returns `{}` when nothing to carry.
 *
 * Client-supplied perf hint only — the server never trusts it for authz.
 */
export function buildParentSnapshots(
	path: string,
	maskBits: string,
): Record<number, Record<string, any>> {
	const snapshots: Record<number, Record<string, any>> = {};
	const url = new URL(path, window.location.origin);
	const match = findMatch(clientRoutes, url.pathname);
	if (!match) return snapshots;
	const layoutIds = (match.route as any).layoutIds as (string | null)[];

	layoutIds.forEach((id, depth) => {
		// maskBits char 0 = page, char depth+1 = layout depth. '0' = skipped.
		if (maskBits[depth + 1] !== "0") return;
		if (id === null) return;
		const entry = appState.loaderCache.layouts[id];
		if (entry) snapshots[depth] = entry.data;
	});

	return snapshots;
}

/** Builds the `/__bosia/data/…` URL for a given client path. */
export function dataUrl(path: string, invalidatedBits?: string): string {
	const url = new URL(path, window.location.origin);
	let p = url.pathname.replace(/\/$/, "");
	let qs = url.search;
	if (invalidatedBits) {
		const sep = qs ? "&" : "?";
		qs = `${qs}${sep}_invalidated=${invalidatedBits}`;
	}
	return `/__bosia/data${p || "/index"}.json${qs}`;
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
	// Warm the route's +loading.svelte chunk alongside its data, so the skeleton
	// paints instantly on click instead of cold-importing after the old page lingers.
	const warmMatch = findMatch(clientRoutes, new URL(path, window.location.origin).pathname);
	(warmMatch?.route as { loading?: (() => Promise<unknown>) | null } | undefined)?.loading?.();

	const existing = prefetchCache.get(path);
	if (existing && Date.now() - existing.ts <= 30_000) return;
	if (existing) prefetchCache.delete(path);
	if (pending.has(path)) return;

	pending.add(path);
	try {
		// Send the same mask as a real client nav would so the server can skip
		// loaders whose tracked inputs haven't changed. Falls back to running
		// everything when the route can't be matched (e.g. external/unknown URL).
		const maskBits = buildMaskBits(path) ?? undefined;
		// Forward cached parent data for skipped layers so a prefetched response
		// is computed with real parent() data, not {}. POST only when there's
		// something to carry — keeps the no-skip case a cacheable/dedupable GET.
		const snapshots = maskBits ? buildParentSnapshots(path, maskBits) : {};
		const init: RequestInit =
			Object.keys(snapshots).length > 0
				? {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ parentSnapshots: snapshots }),
					}
				: {};
		const res = await fetch(dataUrl(path, maskBits), init);
		if (res.ok) {
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

export function initPrefetch(): void {
	// ── Hover strategy (event delegation, 20ms debounce) ─────
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;

	document.addEventListener("mouseover", (e) => {
		if (!(e.target instanceof Element)) return;
		// Early exit: skip if no [data-bosia-preload="hover"] ancestor exists
		const preloadEl = e.target.closest("[data-bosia-preload]");
		if (!preloadEl || preloadEl.getAttribute("data-bosia-preload") !== "hover") return;
		const anchor = e.target.closest("a") as HTMLAnchorElement | null;
		if (!anchor) return;
		const href = getLinkHref(anchor);
		if (!href) return;

		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => prefetchPath(href), 100);
	});

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
