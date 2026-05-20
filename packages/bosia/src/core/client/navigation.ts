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
import { router } from "./router.svelte.ts";
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
	/** Mark every loader dirty so the next nav re-runs all of them. */
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
 * after the navigation has settled (loaders ran, components mounted) or
 * immediately if the URL matches the current route.
 */
export function goto(url: string, opts: GotoOptions = {}): Promise<void> {
	if (typeof window === "undefined") return Promise.resolve();

	if (opts.invalidateAll) {
		appState.dirty.all = true;
	}
	if (opts.noScroll) {
		router.suppressScroll = true;
	}

	const beforePath = router.currentRoute;

	return new Promise<void>((resolve) => {
		appState.navResolvers.push(resolve);
		router.navigate(url, { replace: opts.replaceState, source: "goto" });
		// `navigate()` short-circuits when `currentRoute === path` — the nav
		// effect won't fire, so nothing will drain the resolver. Resolve now.
		if (router.currentRoute === beforePath) {
			drainNavResolvers();
		}
	});
}

/** Internal — App.svelte calls this after each nav effect settles. */
export function drainNavResolvers(): void {
	const queue = appState.navResolvers;
	appState.navResolvers = [];
	for (const fn of queue) {
		try {
			fn();
		} catch (err) {
			console.warn("[bosia] navResolver threw", err);
		}
	}
}
