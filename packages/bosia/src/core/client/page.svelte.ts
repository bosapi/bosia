// ─── Reactive page object ─────────────────────────────────
// Mirrors what user-facing skills (bosia-page-shell, bosia-seo,
// bosia-navigation) teach: `import { page } from "bosia/client"` then read
// `page.url.pathname`. Backed by `router.currentRoute` (`$state` in
// router.svelte.ts), so the `$derived` URL re-runs on every nav.
//
// Bosia passes `params` as a prop to `+page.svelte` / `+layout.svelte` (see
// App.svelte), mirroring the modern SvelteKit `$app/state` direction. Route
// components should destructure `params` from `$props()`. `page.params` was
// removed in 1.1.0.

import { router } from "./router.svelte.ts";

class Page {
	// Real on the server too: the renderer seeds `router.currentRoute`/`.origin`
	// from the request immediately before each render (see `renderWithPageContext`
	// in core/renderer.ts). The `localhost` fallback is now reachable only from a
	// render that seeded nothing at all — a bare unit test, never a served request.
	#url = $derived.by(() => new URL(router.currentRoute, router.origin || "http://localhost/"));

	get url() {
		return this.#url;
	}
	get pathname() {
		return this.#url.pathname;
	}
}

export const page = new Page();
