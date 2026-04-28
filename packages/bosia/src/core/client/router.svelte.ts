// ─── Client Router ────────────────────────────────────────
// Svelte 5 rune-based reactive router.
// Singleton used by App.svelte and hydrate.ts.

import { findMatch } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";

export const router = new class Router {
    currentRoute = $state(typeof window !== "undefined" ? window.location.pathname + window.location.search + window.location.hash : "/");
    params = $state<Record<string, string>>({});
    /** True when navigation was triggered by a link click / navigate() call, false on popstate (back/forward). */
    isPush = $state(true);

    navigate(path: string) {
        if (this.currentRoute === path) return;
        // Unknown route — let the server handle it (renders +error.svelte with 404)
        const pathname = path.split("?")[0].split("#")[0];
        if (!findMatch(clientRoutes, pathname)) {
            window.location.href = path;
            return;
        }
        this.isPush = true;
        this.currentRoute = path;
        if (typeof history !== "undefined") {
            history.pushState({}, "", path);
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
            this.currentRoute = window.location.pathname + window.location.search + window.location.hash;
        });
    }
}();
