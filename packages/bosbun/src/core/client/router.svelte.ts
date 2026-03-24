// ─── Client Router ────────────────────────────────────────
// Svelte 5 rune-based reactive router.
// Singleton used by App.svelte and hydrate.ts.

import { findMatch } from "../matcher.ts";
import { clientRoutes } from "bosbun:routes";

export const router = new class Router {
    currentRoute = $state(typeof window !== "undefined" ? window.location.pathname : "/");
    params = $state<Record<string, string>>({});

    navigate(path: string) {
        if (this.currentRoute === path) return;
        // Unknown route — let the server handle it (renders +error.svelte with 404)
        if (!findMatch(clientRoutes, path)) {
            window.location.href = path;
            return;
        }
        this.currentRoute = path;
        if (typeof history !== "undefined") {
            history.pushState({}, "", path);
        }
    }

    init() {
        if (typeof window === "undefined") return;

        // Intercept <a> clicks for client-side navigation
        window.addEventListener("click", (e) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            if (anchor.origin !== window.location.origin) return;
            if (anchor.target) return;
            if (anchor.hasAttribute("download")) return;
            if (anchor.protocol !== "https:" && anchor.protocol !== "http:") return;

            e.preventDefault();
            this.navigate(anchor.pathname + anchor.search + anchor.hash);
        });

        // Browser back/forward
        window.addEventListener("popstate", () => {
            this.currentRoute = window.location.pathname + window.location.search + window.location.hash;
        });
    }
}();
