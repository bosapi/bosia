// ─── Client Router ────────────────────────────────────────
// Svelte 5 rune-based reactive router.
// Singleton used by App.svelte and hydrate.ts.

import { findMatch, canonicalPathname } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";
import { fireBeforeNavigate, type Navigation } from "./navListeners.ts";

export type NavType = "link" | "goto" | "popstate" | "form" | "enter";

function buildTarget(path: string): { url: URL; params: Record<string, string> } | null {
	if (typeof window === "undefined") return null;
	const pathname = path.split("?")[0].split("#")[0];
	const match = findMatch(clientRoutes, pathname);
	const url = new URL(path, window.location.origin);
	return { url, params: match?.params ?? {} };
}

// ─── Scroll restoration ───
// Positions keyed by a per-entry index stamped into `history.state.bosiaIndex`.
// `scrollRestoration = "manual"` because the browser restores at popstate time,
// before the SPA has rendered the destination page — it clamps against the
// wrong document height. We restore ourselves after the nav settles (App.svelte).
// Persisted to sessionStorage on unload so reload / back-into-app still restores.
const SCROLL_KEY = "bosia:scroll";
let scrollPositions: Record<number, { x: number; y: number }> = {};
let historyIndex = 0;

function saveScroll() {
	scrollPositions[historyIndex] = { x: window.scrollX, y: window.scrollY };
}

// ─── Page snapshots ───
// `export const snapshot = { capture, restore }` in +page.svelte. Captured
// alongside scroll on every history mutation, keyed by the same bosiaIndex,
// restored post-tick by App.svelte. Values must be JSON-serializable — raw in
// memory, stringified only at the unload flush.
// page-only; layout snapshots need per-depth instance refs — add if asked.
const SNAPSHOT_KEY = "bosia:snapshot";
let pageSnapshots: Record<number, unknown> = {};

function savePageSnapshot() {
	try {
		const s = router.getPageSnapshot?.();
		if (s?.capture) pageSnapshots[historyIndex] = s.capture();
	} catch {
		// user capture() threw — never break navigation
	}
}

export function scrollToHash(hash: string): boolean {
	if (typeof document === "undefined" || !hash) return false;
	const raw = hash.startsWith("#") ? hash.slice(1) : hash;
	if (!raw) return false;
	let id = raw;
	try {
		id = decodeURIComponent(raw);
	} catch {
		// Fallback to raw if URI sequence is malformed.
	}
	const el = document.getElementById(id) ?? document.getElementById(raw);
	if (!el) return false;
	el.scrollIntoView();
	return true;
}

export const router = new (class Router {
	currentRoute = $state(
		typeof window !== "undefined"
			? window.location.pathname + window.location.search + window.location.hash
			: "/",
	);
	params = $state<Record<string, string>>({});
	/** True when navigation was triggered by a link click / navigate() call, false on popstate (back/forward). */
	isPush = $state(true);
	/** Source of the most recent navigation — feeds the Navigation object passed to lifecycle hooks. */
	lastNavType: NavType = "enter";
	/** Set by `goto({ noScroll: true })`; consumed once by App.svelte after the next nav settles. */
	suppressScroll = false;
	/** Saved scroll position for the entry a popstate landed on; consumed once by App.svelte after the nav settles. */
	pendingScroll: { x: number; y: number } | null = null;
	/** Set by App.svelte; returns the mounted page's `export const snapshot` (if any) at capture time. */
	getPageSnapshot:
		| (() => { capture: () => unknown; restore: (v: any) => void } | undefined)
		| null = null;
	/** Captured snapshot for the entry a popstate/reload landed on; consumed once by App.svelte. `undefined` = nothing to restore. */
	pendingSnapshot: unknown = undefined;

	navigate(path: string, opts: { replace?: boolean; source?: NavType } = {}) {
		if (this.currentRoute === path) return;
		// Unknown route — let the server handle it (renders +error.svelte with 404)
		const queryHash = path.slice(path.split("?")[0].split("#")[0].length);
		const pathname = path.split("?")[0].split("#")[0];
		const match = findMatch(clientRoutes, pathname);
		if (!match) {
			window.location.href = path;
			return;
		}
		// Canonicalize trailing slash before navigating (matches server 308 behavior)
		const canonical = canonicalPathname(pathname, (match.route as any).trailingSlash ?? "never");
		const finalPath = canonical !== null ? canonical + queryHash : path;

		const navType: NavType = opts.source ?? "link";
		const fromTarget = buildTarget(this.currentRoute);
		const toTarget = buildTarget(finalPath);
		const nav: Navigation = {
			from: fromTarget,
			to: toTarget,
			type: navType,
			willUnload: false,
			cancel: () => {},
		};
		if (!fireBeforeNavigate(nav)) return;

		this.lastNavType = navType;
		this.isPush = true;
		this.pendingScroll = null;
		this.pendingSnapshot = undefined;
		this.currentRoute = finalPath;
		if (typeof history !== "undefined") {
			if (opts.replace) {
				history.replaceState({ bosiaIndex: historyIndex }, "", finalPath);
			} else {
				saveScroll();
				savePageSnapshot();
				historyIndex++;
				history.pushState({ bosiaIndex: historyIndex }, "", finalPath);
			}
		}
	}

	init() {
		if (typeof window === "undefined") return;

		history.scrollRestoration = "manual";
		try {
			scrollPositions = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? "{}");
		} catch {
			scrollPositions = {};
		}
		try {
			pageSnapshots = JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) ?? "{}");
		} catch {
			pageSnapshots = {};
		}
		const stamped = history.state?.bosiaIndex != null;
		historyIndex = stamped ? history.state.bosiaIndex : 0;
		this.pendingSnapshot = stamped ? pageSnapshots[historyIndex] : undefined;
		history.replaceState({ ...history.state, bosiaIndex: historyIndex }, "");
		// Restore after a reload — manual mode means the browser won't. Only for
		// entries we stamped before (a fresh visit has no bosiaIndex in state).
		const initial = scrollPositions[historyIndex];
		if (stamped && initial) {
			requestAnimationFrame(() => window.scrollTo(initial.x, initial.y));
		}

		// Intercept <a> clicks for client-side navigation
		window.addEventListener("click", (e) => {
			// Let browser handle non-primary buttons, modifier-clicks, already-handled events
			if (e.button !== 0) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			if (e.defaultPrevented) return;

			const anchor = (e.target as HTMLElement).closest("a");
			if (!anchor) return;
			if (anchor.origin !== window.location.origin) return;
			if (anchor.target) return;
			if (anchor.hasAttribute("download")) return;
			if (anchor.rel.split(/\s+/).includes("external")) return;
			if (anchor.protocol !== "https:" && anchor.protocol !== "http:") return;

			// Same-page hash navigation: skip page reload, just update URL and scroll
			// to the target element. Mirrors browser default for in-page anchors.
			const samePage =
				anchor.pathname === window.location.pathname && anchor.search === window.location.search;
			if (samePage && anchor.hash) {
				e.preventDefault();
				const finalPath = anchor.pathname + anchor.search + anchor.hash;
				if (this.currentRoute !== finalPath) {
					saveScroll();
					savePageSnapshot();
					historyIndex++;
					history.pushState({ bosiaIndex: historyIndex }, "", finalPath);
					this.currentRoute = finalPath;
				}
				scrollToHash(anchor.hash);
				return;
			}

			e.preventDefault();
			this.navigate(anchor.pathname + anchor.search + anchor.hash, { source: "link" });
		});

		// Browser back/forward
		window.addEventListener("popstate", (e) => {
			const finalPath = window.location.pathname + window.location.search + window.location.hash;
			// Save the position of the entry we're leaving (historyIndex is still
			// the old entry's), then look up where the landed-on entry was.
			saveScroll();
			savePageSnapshot();
			historyIndex = e.state?.bosiaIndex ?? 0;
			this.pendingScroll = scrollPositions[historyIndex] ?? null;
			this.pendingSnapshot = pageSnapshots[historyIndex];
			// Fire beforeNavigate listeners; popstate can't be reliably cancelled
			// (browser history already advanced), so we surface the event for
			// observation only — `cancel()` is a no-op for this source.
			const fromTarget = buildTarget(this.currentRoute);
			const toTarget = buildTarget(finalPath);
			const nav: Navigation = {
				from: fromTarget,
				to: toTarget,
				type: "popstate",
				willUnload: false,
				cancel: () => {},
			};
			fireBeforeNavigate(nav);

			this.lastNavType = "popstate";
			this.isPush = false;
			this.currentRoute = finalPath;
		});

		// Full-page unload — fire beforeNavigate with willUnload=true so
		// listeners can warn-on-leave (return value ignored; cancellation here
		// requires `beforeunload`, not in scope).
		window.addEventListener("beforeunload", () => {
			// beforeunload can be skipped on mobile page-discard; add a
			// visibilitychange persist if restore-after-reload proves flaky there.
			saveScroll();
			savePageSnapshot();
			try {
				sessionStorage.setItem(SCROLL_KEY, JSON.stringify(scrollPositions));
			} catch {
				// sessionStorage unavailable (private mode / quota) — skip persistence.
			}
			try {
				// Separate try: a non-JSON-serializable snapshot must not kill scroll persistence.
				sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(pageSnapshots));
			} catch {
				// sessionStorage unavailable or snapshot not serializable — skip persistence.
			}
			const fromTarget = buildTarget(this.currentRoute);
			const nav: Navigation = {
				from: fromTarget,
				to: null,
				type: "link",
				willUnload: true,
				cancel: () => {},
			};
			fireBeforeNavigate(nav);
		});
	}
})();
