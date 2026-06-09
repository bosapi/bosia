// ─── Reactive page object ─────────────────────────────────
// Mirrors what user-facing skills (bosia-page-shell, bosia-seo,
// bosia-navigation) teach: `import { page } from "bosia/client"` then read
// `page.url.pathname`. Backed by `router.currentRoute` (`$state` in
// router.svelte.ts), so the `$derived` URL re-runs on every nav.
//
// No `params` getter on purpose — Bosia already passes `params` as a prop to
// `+page.svelte` / `+layout.svelte` (see App.svelte), mirroring the modern
// SvelteKit `$app/state` direction. Route components should destructure
// `params` from `$props()`, not from here.

import { router } from "./router.svelte.ts";

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
}

export const page = new Page();
