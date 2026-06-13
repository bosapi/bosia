// ─── Reactive page object ─────────────────────────────────
// Mirrors what user-facing skills (bosia-page-shell, bosia-seo,
// bosia-navigation) teach: `import { page } from "bosia/client"` then read
// `page.url.pathname`. Backed by `router.currentRoute` (`$state` in
// router.svelte.ts), so the `$derived` URL re-runs on every nav.
//
// Bosia passes `params` as a prop to `+page.svelte` / `+layout.svelte` (see
// App.svelte), mirroring the modern SvelteKit `$app/state` direction. Route
// components should destructure `params` from `$props()`. `page.params` still
// exists as a deprecated, working fallback (reactive, backed by
// `appState.routeParams`) so legacy code keeps running — it will be removed in
// 1.0.0.

import { appState } from "./appState.svelte.ts";
import { router } from "./router.svelte.ts";

let paramsWarned = false;

class Page {
	#url = $derived.by(() => {
		if (typeof window === "undefined") return new URL("http://localhost/");
		return new URL(router.currentRoute, window.location.origin);
	});

	get url() {
		return this.#url;
	}
	get pathname() {
		return this.#url.pathname;
	}

	/**
	 * @deprecated Read route params from `$props()` instead:
	 * `let { params } = $props()` in `+page.svelte` / `+layout.svelte`.
	 * `page.params` is a temporary fallback and will be removed in 1.0.0.
	 */
	get params() {
		if (process.env.NODE_ENV !== "production" && !paramsWarned) {
			paramsWarned = true;
			console.warn(
				"[bosia] page.params is deprecated — destructure `params` from $props() in your route component. It will be removed in 1.0.0.",
			);
		}
		return appState.routeParams;
	}
}

export const page = new Page();
