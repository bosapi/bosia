// ─── Client Router ────────────────────────────────────────
// Svelte 5 rune-based reactive router.
// Singleton used by App.svelte and hydrate.ts.

import { findMatch, canonicalPathname } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";

export const router = new (class Router {
	currentRoute = $state(
		typeof window !== "undefined"
			? window.location.pathname + window.location.search + window.location.hash
			: "/",
	);
	params = $state<Record<string, string>>({});
	/** True when navigation was triggered by a link click / navigate() call, false on popstate (back/forward). */
	isPush = $state(true);

	navigate(path: string) {
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
		const canonical = canonicalPathname(
			pathname,
			(match.route as any).trailingSlash ?? "never",
		);
		const finalPath = canonical !== null ? canonical + queryHash : path;
		this.isPush = true;
		this.currentRoute = finalPath;
		if (typeof history !== "undefined") {
			history.pushState({}, "", finalPath);
		}
	}

	init() {
		if (typeof window === "undefined") return;

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

			e.preventDefault();
			this.navigate(anchor.pathname + anchor.search + anchor.hash);
		});

		// Browser back/forward
		window.addEventListener("popstate", () => {
			this.isPush = false;
			this.currentRoute =
				window.location.pathname + window.location.search + window.location.hash;
		});
	}
})();
