import { hydrate } from "svelte";
import App from "./App.svelte";
import { router } from "./router.svelte.ts";
import { findMatch } from "../matcher.ts";
import { clientRoutes } from "bunia:routes";

// ─── Hydration ────────────────────────────────────────────

async function main() {
    const path = window.location.pathname;

    router.init();
    router.currentRoute = path;

    // Resolve the current route so we can pre-load the components
    // before handing off to App.svelte (avoids a flash of "Loading...")
    const match = findMatch(clientRoutes, path);

    let ssrPageComponent = null;
    let ssrLayoutComponents: any[] = [];

    if (match) {
        const [pageMod, ...layoutMods] = await Promise.all([
            match.route.page(),
            ...match.route.layouts.map(l => l()),
        ]);
        ssrPageComponent = pageMod.default;
        ssrLayoutComponents = layoutMods.map(m => m.default);
        router.params = match.params;
    }

    hydrate(App, {
        target: document.getElementById("app")!,
        props: {
            ssrMode: false,
            ssrPageComponent,
            ssrLayoutComponents,
            ssrPageData: (window as any).__BUNIA_PAGE_DATA__ ?? {},
            ssrLayoutData: (window as any).__BUNIA_LAYOUT_DATA__ ?? [],
            ssrFormData: (window as any).__BUNIA_FORM_DATA__ ?? null,
        },
    });
}

main();

// ─── Hot Reload (dev only) ────────────────────────────────

if (process.env.NODE_ENV !== "production") {
    let connectedOnce = false;
    let retryDelay = 1000;

    function connectSSE() {
        const es = new EventSource("/__bunia/sse");

        es.addEventListener("reload", () => {
            console.log("[Bunia] Reloading...");
            window.location.reload();
        });

        es.onopen = () => {
            retryDelay = 1000;
            if (connectedOnce) {
                // Server came back up after a restart — reload immediately
                window.location.reload();
            }
            connectedOnce = true;
        };

        es.onerror = () => {
            es.close();
            console.log(`[Bunia] SSE disconnected. Retrying in ${retryDelay / 1000}s...`);
            setTimeout(connectSSE, retryDelay);
            retryDelay = Math.min(retryDelay + 1000, 5000);
        };
    }

    connectSSE();
}
