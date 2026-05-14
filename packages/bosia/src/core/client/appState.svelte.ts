// ─── Shared App State ─────────────────────────────────────
// Singleton holding reactive cells that App.svelte renders from.
// Lives in a module so client-side helpers (e.g. `use:enhance`)
// can read and update the same state without going through props.
//
// Server-side: never touched. App.svelte's template branches on
// `ssrMode` and reads from `ssrXxx` props directly during SSR,
// so concurrent requests don't share these cells.

import type { CacheEntry, DirtyState } from "./loaderCache.ts";

class AppState {
	pageData = $state<Record<string, any>>({});
	layoutData = $state<Record<string, any>[]>([]);
	routeParams = $state<Record<string, string>>({});
	form = $state<any>(null);
	// Nested-error boundary state — set when a client navigation hits an
	// error and a matching +error.svelte is found. Cleared on every
	// successful navigation in App.svelte.
	errorComponent = $state<any>(null);
	errorProps = $state<{ error: { status: number; message: string } } | null>(null);
	errorDepth = $state<number | null>(null);
	// Loader cache — keyed by stable id (codegen-emitted server file path).
	// Mirrors the most recent successful run of each layout/page server loader.
	// Wiped on hard refresh, never persisted.
	loaderCache: { page: CacheEntry | null; layouts: Record<string, CacheEntry> } = {
		page: null,
		layouts: {},
	};
	// Pending invalidations consumed by the next data fetch. Mutated by
	// `invalidate()` / `invalidateAll()` and cleared after the request fires.
	dirty: DirtyState = {
		all: false,
		keys: new Set<string>(),
		urls: new Set<string>(),
		urlMatchers: [],
	};
	// Bumped by `invalidate*()` to wake the App.svelte nav effect, so calling
	// `invalidate("k")` re-runs the loader pipeline without changing the URL.
	invalidationTick = $state(0);
}

export const appState = new AppState();

export function clearDirty(): void {
	appState.dirty.all = false;
	appState.dirty.keys.clear();
	appState.dirty.urls.clear();
	appState.dirty.urlMatchers = [];
}
