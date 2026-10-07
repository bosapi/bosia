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
//
// `page.route.id` is the matched route's folder path with groups kept
// (`/(private)/dashboard/[id]`), the same id hooks and loaders get. `null` when
// no route matches, e.g. on the 404 page.

import { router } from "./router.svelte.ts";
import { findMatch } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";

class Page {
	// Real on the server too: the renderer seeds `router.currentRoute`/`.origin`
	// from the request immediately before each render (see `renderWithPageContext`
	// in core/renderer.ts). The `localhost` fallback is now reachable only from a
	// render that seeded nothing at all — a bare unit test, never a served request.
	#url = $derived.by(() => new URL(router.currentRoute, router.origin || "http://localhost/"));

	// clientRoutes carry the BASE_PATH prefix, and so does `router.currentRoute`
	// (the renderer puts it back before SSR), so the pathname matches as-is.
	#route = $derived.by(() => ({
		id: findMatch(clientRoutes, this.#url.pathname)?.route.id ?? null,
	}));

	get url() {
		return this.#url;
	}
	get pathname() {
		return this.#url.pathname;
	}
	get route() {
		return this.#route;
	}
}

export const page = new Page();
