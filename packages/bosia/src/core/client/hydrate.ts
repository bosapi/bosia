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
	// Network protocol still ships `params` merged into pageData; strip it
	// so the in-memory pageData mirrors what +page.svelte receives.
	const { params: _p, ...pageDataNoParams } = ssrPageData ?? {};
	appState.pageData = pageDataNoParams;
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

main().catch((err) => {
	// Without this, a hydration failure leaves "Loading..." stuck on screen
	// with no console signal. Surface it loudly instead.
	console.error("[bosia] hydration failed", err);
});

// ─── Stale-Build Recovery ─────────────────────────────────
// After a deploy, browsers with the old HTML/entry cached may try to import
// hashed chunks that no longer exist on the server. The dynamic import()
// rejects and the router's promise chain has no .catch, so the rejection
// surfaces here as an unhandledrejection. Trigger a single full reload with a
// cache-busting query so the browser can't serve the old HTML from disk.
// A 10s sessionStorage guard prevents an infinite reload loop if the new
// build is also broken.
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
	const KEY = "bosia:reload-attempt";
	const STALE_CHUNK =
		/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk|ChunkLoadError/i;

	try {
		const last = Number(sessionStorage.getItem(KEY) ?? 0);
		if (last && Date.now() - last < 10_000) {
			sessionStorage.removeItem(KEY);
			console.error("[bosia] reload guard hit — new build may also be broken.");
		} else {
			window.addEventListener("unhandledrejection", (e) => {
				const msg = String((e.reason as { message?: unknown })?.message ?? e.reason ?? "");
				if (!STALE_CHUNK.test(msg)) return;
				e.preventDefault();
				try {
					sessionStorage.setItem(KEY, String(Date.now()));
				} catch {
					// Storage may be unavailable (private mode) — best effort.
				}
				const sep = window.location.search ? "&" : "?";
				window.location.replace(
					`${window.location.pathname}${window.location.search}${sep}_v=${Date.now()}${window.location.hash}`,
				);
			});
		}
	} catch {
		// sessionStorage may throw in restricted contexts — give up silently.
	}
}

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
