import { hydrate, mount } from "svelte";
import App from "./App.svelte";
import { router } from "./router.svelte.ts";
import { initPrefetch } from "./prefetch.ts";
import { findMatch, compileRoutes, canonicalPathname } from "../matcher.ts";
import { clientRoutes } from "bosia:routes";
import { appState } from "./appState.svelte.ts";
import { captureSnapshot, liveContext, type CacheEntry } from "./loaderCache.ts";
import type { LoaderDeps } from "../hooks.ts";

// Pre-compile route patterns into RegExp at startup (shared by App.svelte and router via module reference)
compileRoutes(clientRoutes);

function readJsonScript<T>(id: string): T | null {
	const el = document.getElementById(id);
	if (!el) return null;
	try {
		return JSON.parse(el.textContent ?? "null") as T;
	} catch {
		return null;
	}
}

// ─── Hydration ────────────────────────────────────────────

async function main() {
	const path = window.location.pathname;

	router.init();

	// Resolve the current route so we can pre-load the components
	// before handing off to App.svelte (avoids a flash of "Loading...")
	const match = findMatch(clientRoutes, path);

	// Canonicalize trailing slash on initial mount — server already 308'd if
	// SSR'd, but `ssr=false` shells and prerendered pages can land on the
	// non-canonical URL. replaceState (no extra history entry).
	if (match) {
		const canonical = canonicalPathname(path, (match.route as any).trailingSlash ?? "never");
		if (canonical !== null && typeof history !== "undefined") {
			history.replaceState(
				history.state,
				"",
				canonical + window.location.search + window.location.hash,
			);
		}
	}
	router.currentRoute = window.location.pathname + window.location.search + window.location.hash;
	initPrefetch();

	let ssrPageComponent = null;
	let ssrLayoutComponents: any[] = [];

	if (match) {
		const [pageMod, ...layoutMods] = await Promise.all([
			match.route.page(),
			...match.route.layouts.map((l) => l()),
		]);
		ssrPageComponent = pageMod.default;
		ssrLayoutComponents = layoutMods.map((m) => m.default);
		router.params = match.params;
	}

	const ssrPageData = readJsonScript<Record<string, any>>("__bosia-page-data__") ?? {};
	const ssrLayoutData = readJsonScript<Record<string, any>[]>("__bosia-layout-data__") ?? [];
	const ssrFormData = readJsonScript<Record<string, any>>("__bosia-form-data__");

	// Seed shared client state so `use:enhance` and other helpers
	// start from the same values App.svelte renders during hydration.
	appState.pageData = ssrPageData;
	appState.layoutData = ssrLayoutData;
	appState.routeParams = ssrPageData?.params ?? match?.params ?? {};
	appState.form = ssrFormData;

	// Seed the loader cache from window globals emitted server-side so the
	// next client navigation can decide which loaders to skip without an
	// extra fetch round-trip.
	if (match) {
		const url = new URL(window.location.href);
		const ctx = liveContext(window.location.pathname, match.params, url);
		const ssrPageDeps: LoaderDeps | null = (window as any).__BOSIA_PAGE_DEPS__ ?? null;
		const ssrLayoutDeps: (LoaderDeps | null)[] = (window as any).__BOSIA_LAYOUT_DEPS__ ?? [];
		const pageId = (match.route as any).pageId as string | null;
		const layoutIds = (match.route as any).layoutIds as (string | null)[];

		if (pageId !== null && ssrPageDeps && ssrPageData) {
			const entry: CacheEntry = {
				nodeId: pageId,
				data: ssrPageData,
				deps: ssrPageDeps,
				snapshot: captureSnapshot(ssrPageDeps, ctx),
			};
			appState.loaderCache.page = entry;
		}
		for (let i = 0; i < layoutIds.length; i++) {
			const id = layoutIds[i];
			if (id === null) continue;
			const deps = ssrLayoutDeps[i];
			const data = ssrLayoutData[i];
			if (!deps || !data) continue;
			const entry: CacheEntry = {
				nodeId: id,
				data,
				deps,
				snapshot: captureSnapshot(deps, ctx),
			};
			appState.loaderCache.layouts[id] = entry;
		}
	}

	const target = document.getElementById("app")!;
	const props = {
		ssrMode: false,
		ssrPageComponent,
		ssrLayoutComponents,
		ssrPageData,
		ssrLayoutData,
		ssrFormData,
	};

	// ssr=false → server shipped empty shell, no hydration markers exist.
	// Use mount() instead of hydrate() to render fresh on the client.
	if ((window as any).__BOSIA_SSR__ === false) {
		mount(App, { target, props });
	} else {
		hydrate(App, { target, props });
	}
}

main();

// ─── Hot Reload (dev only) ────────────────────────────────

if (process.env.NODE_ENV !== "production") {
	let connectedOnce = false;
	let retryDelay = 1000;

	function connectSSE() {
		const es = new EventSource("/__bosia/sse");

		es.addEventListener("reload", () => {
			console.log("[Bosia] Reloading...");
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
			console.log(`[Bosia] SSE disconnected. Retrying in ${retryDelay / 1000}s...`);
			setTimeout(connectSSE, retryDelay);
			retryDelay = Math.min(retryDelay + 1000, 5000);
		};
	}

	connectSSE();
}
