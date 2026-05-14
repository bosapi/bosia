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

import { appState } from "./appState.svelte.ts";

type InvalidateTarget = string | URL | ((url: URL) => boolean);

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
