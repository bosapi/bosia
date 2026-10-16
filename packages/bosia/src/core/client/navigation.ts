// ─── Public Invalidation API ──────────────────────────────
// Counterpart to SvelteKit's `invalidate()` / `invalidateAll()`. Marks
// loader cache entries dirty and triggers the App.svelte nav effect to
// re-run only the loaders whose dependencies were invalidated.
//
// Usage:
//   import { invalidate, invalidateAll } from "bosia/client";
//   await invalidate("app:user");
//   await invalidate("/api/posts");
//   await invalidate((url) => url.pathname.startsWith("/api/"));
//   await invalidateAll();

import { onDestroy } from "svelte";
import { appState } from "./appState.svelte.ts";
import { router, type NavType } from "./router.svelte.ts";
import {
	afterListeners,
	beforeListeners,
	type AfterNavigateCallback,
	type BeforeNavigateCallback,
} from "./navListeners.ts";

type InvalidateTarget = string | URL | ((url: URL) => boolean);

export type { Navigation, NavigationTarget } from "./navListeners.ts";

/**
 * Register a callback that runs before each client-side navigation. The
 * callback may call `nav.cancel()` to block the navigation. Auto-unregisters
 * when the calling Svelte component is destroyed.
 */
export function beforeNavigate(fn: BeforeNavigateCallback): void {
	beforeListeners.add(fn);
	try {
		onDestroy(() => beforeListeners.delete(fn));
	} catch {
		// Not inside a component — caller is responsible for lifetime.
	}
}

/**
 * Register a callback that runs after each client-side navigation settles.
 * Auto-unregisters when the calling Svelte component is destroyed.
 */
export function afterNavigate(fn: AfterNavigateCallback): void {
	afterListeners.add(fn);
	try {
		onDestroy(() => afterListeners.delete(fn));
	} catch {
		// Not inside a component — caller is responsible for lifetime.
	}
}

function bumpTick() {
	appState.invalidationTick = appState.invalidationTick + 1;
}

/**
 * Mark a dependency as invalid; the next navigation (and any in-progress
 * navigation that hasn't started its fetch yet) will re-run loaders that
 * declared a matching `depends()` key, fetched a matching URL, or — when
 * given a predicate — fetched any URL the predicate returns true for.
 *
 * Returns a promise that resolves after the nav effect has flushed.
 */
export function invalidate(target: InvalidateTarget): Promise<void> {
	if (typeof target === "function") {
		appState.dirty.urlMatchers.push(target);
	} else {
		const str = typeof target === "string" ? target : target.href;
		const isUrl = str.startsWith("/") || str.includes("://");
		if (isUrl) {
			try {
				// Normalize to an absolute URL — fetches the loader recorded are
				// always absolute, so a relative `/api/foo` must be promoted here.
				const abs = new URL(str, window.location.origin).href;
				appState.dirty.urls.add(abs);
			} catch {
				appState.dirty.urls.add(str);
			}
		} else {
			appState.dirty.keys.add(str);
		}
	}
	bumpTick();
	return Promise.resolve();
}

/**
 * Mark every loader as invalid. Next navigation re-runs all of them.
 */
export function invalidateAll(): Promise<void> {
	appState.dirty.all = true;
	bumpTick();
	return Promise.resolve();
}

// ─── goto ─────────────────────────────────────────────────
// Programmatic SPA navigation. Counterpart to SvelteKit's `goto()`.
//
// Usage:
//   import { goto } from "bosia/client";
//   await goto("/dashboard");
//   await goto("/login", { replaceState: true, invalidateAll: true });

export interface GotoOptions {
	/** Use `history.replaceState` instead of `history.pushState`. */
	replaceState?: boolean;
	/** Re-run every loader for the destination — also when it is the current URL. */
	invalidateAll?: boolean;
	/** Skip the default scroll-to-top after navigation. */
	noScroll?: boolean;
	/** Reserved — not yet honored by the framework. */
	keepFocus?: boolean;
	/** Reserved — not yet honored (no shallow routing). */
	state?: Record<string, unknown>;
}

/**
 * Navigate to `url` via the client router. Returns a Promise that resolves
 * after the navigation has settled (loaders ran, components mounted). On the
 * current URL it resolves immediately — unless `invalidateAll` is set, then
 * after the loaders re-ran in place.
 */
export function goto(url: string, opts: GotoOptions = {}): Promise<void> {
	return go(
		url,
		{ replace: opts.replaceState, noScroll: opts.noScroll, source: "goto" },
		!!opts.invalidateAll,
	);
}

/** Internal — `goto()` and `use:enhance` redirects. `reload` re-runs every loader (enhance: unless `update({ invalidateAll: false })`). */
export function go(
	url: string,
	opts: { replace?: boolean; noScroll?: boolean; source?: NavType },
	reload: boolean,
): Promise<void> {
	if (typeof window === "undefined") return Promise.resolve();

	return new Promise<void>((resolve) => {
		const result = router.navigate(url, { replace: opts.replace, source: opts.source });
		// The nav effect runs after this, so marks set now still reach it — and a nav
		// that never starts (cancelled, left the app) leaves none behind for the next one.
		if (result === "started" && opts.noScroll) router.suppressScroll = true;
		const refetch = reload && (result === "started" || result === "same");
		// The tick wakes the effect on the same URL, and on a new one it keeps a
		// prefetch holding pre-mutation data from standing in for the refetch.
		if (refetch) invalidateAll();
		// "same" while a nav to it is still loading waits for it too.
		const wait = result === "started" || (result === "same" && (reload || router.loading));
		// Otherwise nothing will settle: resolve just this call — draining the queue
		// would also release a nav still loading.
		if (wait) appState.navResolvers.push(resolve);
		else resolve();
	});
}

/** Internal — App.svelte calls this after each nav effect settles. */
// Takes the waiters now (a nav started meanwhile queues its own), releases them
// once `after` (the settling nav's scroll) is done.
export function drainNavResolvers(after?: Promise<unknown>): void {
	const queue = appState.navResolvers;
	appState.navResolvers = [];
	const run = () => {
		for (const fn of queue) {
			try {
				fn();
			} catch (err) {
				console.warn("[bosia] navResolver threw", err);
			}
		}
	};
	// A throwing flush rejects the scroll; the waiters must not hang on it.
	if (after) after.then(run, run);
	else run();
}
