// ─── Shared App State ─────────────────────────────────────
// Singleton holding reactive cells that App.svelte renders from.
// Lives in a module so client-side helpers (e.g. `use:enhance`)
// can read and update the same state without going through props.
//
// Server-side: never touched. App.svelte's template branches on
// `ssrMode` and reads from `ssrXxx` props directly during SSR,
// so concurrent requests don't share these cells.

import { dataUrl } from "./prefetch.ts";
import { router } from "./router.svelte.ts";

class AppState {
	pageData = $state<Record<string, any>>({});
	layoutData = $state<Record<string, any>[]>([]);
	routeParams = $state<Record<string, string>>({});
	form = $state<any>(null);
}

export const appState = new AppState();

/**
 * Re-fetch loader data for the given path and apply to `appState`.
 * Used by `use:enhance` after a successful action — mirrors SvelteKit's
 * `invalidateAll` default. No-op if the fetch fails or returns an error.
 */
export async function refreshData(path: string): Promise<void> {
	try {
		const res = await fetch(dataUrl(path));
		if (!res.ok) return;
		const result = await res.json();
		if (result?.redirect) {
			router.navigate(result.redirect);
			return;
		}
		if (result?.error) return;
		appState.pageData = result?.pageData ?? {};
		appState.layoutData = result?.layoutData ?? [];
		appState.routeParams = result?.pageData?.params ?? appState.routeParams;
		if (result?.metadata) {
			if (result.metadata.title) document.title = result.metadata.title;
			if (result.metadata.description) {
				let meta = document.querySelector(
					'meta[name="description"]',
				) as HTMLMetaElement | null;
				if (!meta) {
					meta = document.createElement("meta");
					meta.name = "description";
					document.head.appendChild(meta);
				}
				meta.content = result.metadata.description;
			}
		}
	} catch {
		// best-effort — silently swallow
	}
}
