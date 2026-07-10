<script lang="ts">
	import { tick } from "svelte";
	import { router, scrollToHash } from "./router.svelte.ts";
	import { findMatch } from "../matcher.ts";
	import { clientRoutes } from "bosia:routes";
	import { consumePrefetch, prefetchCache, dataUrl, buildParentSnapshots } from "./prefetch.ts";
	import { appState, clearDirty } from "./appState.svelte.ts";
	import { captureSnapshot, liveContext, shouldRerun, type CacheEntry } from "./loaderCache.ts";
	import { pickErrorPage } from "../errorMatch.ts";
	import { fireAfterNavigate, type Navigation } from "./navListeners.ts";
	import { drainNavResolvers } from "./navigation.ts";

	let {
		ssrMode = false,
		ssrPageComponent = null,
		ssrLayoutComponents = [],
		ssrPageData = {},
		ssrLayoutData = [],
		ssrFormData = null,
		ssrErrorComponent = null,
		ssrErrorProps = null,
		ssrErrorDepth = null,
	}: {
		ssrMode?: boolean;
		ssrPageComponent?: any;
		ssrLayoutComponents?: any[];
		ssrPageData?: Record<string, any>;
		ssrLayoutData?: Record<string, any>[];
		ssrFormData?: any;
		ssrErrorComponent?: any;
		ssrErrorProps?: { error: { status: number; message: string } } | null;
		ssrErrorDepth?: number | null;
	} = $props();

	let PageComponent = $state<any>(ssrPageComponent);
	let layoutComponents = $state<any[]>(ssrLayoutComponents ?? []);
	// Mounted page instance — the two <PageComponent> render spots are mutually
	// exclusive branches, so one ref suffices. Exposes `export const snapshot`.
	let pageInstance = $state<any>(null);
	if (!ssrMode) router.getPageSnapshot = () => pageInstance?.snapshot;

	// Call the landed-on page's snapshot.restore() once it's mounted (post-tick).
	function settleSnapshot() {
		const snap = router.pendingSnapshot;
		if (snap !== undefined)
			tick().then(() => {
				try {
					pageInstance?.snapshot?.restore?.(snap);
				} catch {
					// user restore() threw — never break navigation
				}
			});
		router.pendingSnapshot = undefined;
	}
	// Network protocol still ships `params` merged into pageData (see renderer.ts).
	// Strip it at the component boundary so consumers receive `params` only via
	// the dedicated prop, matching SvelteKit's surface.
	const stripParams = (d: Record<string, any>) => {
		const { params: _p, ...rest } = d;
		return rest;
	};
	// In SSR mode, render directly from props (server module singletons must
	// not hold per-request state). On the client, read/write through `appState`
	// so `use:enhance` and other helpers can update the same cells.
	const pageData = $derived(ssrMode ? stripParams(ssrPageData ?? {}) : appState.pageData);
	const layoutData = $derived(ssrMode ? (ssrLayoutData ?? []) : appState.layoutData);
	const params = $derived(ssrMode ? (ssrPageData?.params ?? {}) : appState.routeParams);
	const formData = $derived(ssrMode ? ssrFormData : appState.form);
	const ErrorComponent = $derived(ssrMode ? ssrErrorComponent : appState.errorComponent);
	const errorProps = $derived(ssrMode ? ssrErrorProps : appState.errorProps);
	const errorDepth = $derived(ssrMode ? ssrErrorDepth : appState.errorDepth);
	let navigating = $state(false);
	let navDone = $state(false);
	// +loading.svelte skeleton shown during navigation to a route that has one.
	let LoadingComponent = $state<any>(null);
	let loadingDepth = $state(0); // # of shared layouts to keep mounted under the loader
	let showLoading = $state(false);
	let currentLayoutPaths: string[] = [];
	let lastSettledPath = "";
	// Skip bar on the very first effect run (initial hydration — data already present)
	let firstNav = true;
	let navDoneTimer: ReturnType<typeof setTimeout> | null = null;

	// Scroll after a nav settles: forward navs go to top (or the URL hash);
	// back/forward navs restore the position saved for that history entry.
	// Runs after tick() so the destination page's real height is in the DOM.
	// goto({ noScroll: true }) flips `router.suppressScroll` for one nav.
	function settleScroll() {
		if (router.isPush && !router.suppressScroll) {
			const hash = window.location.hash;
			tick().then(() => {
				if (!scrollToHash(hash)) window.scrollTo(0, 0);
			});
		} else if (!router.isPush) {
			const pos = router.pendingScroll;
			// single post-tick restore; content that loads later (images
			// without dimensions) can still shift it. Revisit only if reported.
			if (pos) tick().then(() => window.scrollTo(pos.x, pos.y));
		}
		router.pendingScroll = null;
		router.suppressScroll = false;
		settleSnapshot();
	}

	$effect(() => {
		if (ssrMode) return;

		// Subscribe to `invalidationTick` so `invalidate()` can wake the effect
		// without a URL change.
		void appState.invalidationTick;

		const path = router.currentRoute;
		const pathname = path.split("?")[0].split("#")[0];
		const match = findMatch(clientRoutes, pathname);
		if (!match) return;

		let cancelled = false;

		const isFirst = firstNav;
		firstNav = false;
		if (isFirst) {
			currentLayoutPaths = (match.route as any).layoutPaths ?? [];
			lastSettledPath = pathname;
			// Restore-after-reload: router.init() staged this entry's snapshot.
			settleSnapshot();
			return; // Initial hydration — data already in SSR props, no fetch needed
		}

		appState.form = null;
		if (navDoneTimer) {
			clearTimeout(navDoneTimer);
			navDoneTimer = null;
		}
		navDone = false;
		navigating = true;

		// ─── +loading.svelte skeleton ─────────────────────────────────────
		// On a real path change, show the destination's loading skeleton nested
		// inside the layouts shared with the current page. The destination's own
		// added layouts aren't mounted yet, so the skeleton draws that chrome.
		const destLayoutPaths = ((match.route as any).layoutPaths as string[]) ?? [];
		const loadingImport = (match.route as any).loading as (() => Promise<any>) | null;
		if (loadingImport && pathname !== lastSettledPath) {
			let s = 0;
			while (
				s < currentLayoutPaths.length &&
				s < destLayoutPaths.length &&
				currentLayoutPaths[s] === destLayoutPaths[s]
			)
				s++;
			loadingImport().then((m) => {
				if (cancelled) return; // superseded nav
				loadingDepth = s;
				LoadingComponent = m.default;
				showLoading = true;
			});
		}

		// ─── Loader cache: decide which loaders need to re-run ─────────────
		// For each layout depth + the page, compare the cached entry (if any)
		// against the live URL/params and the dirty set. If everything is
		// cacheable, skip the fetch entirely.
		const url = new URL(path, window.location.origin);
		const ctx = liveContext(pathname, match.params, url);
		const layoutIds = (match.route as any).layoutIds as (string | null)[];
		const pageId = (match.route as any).pageId as string | null;

		const layoutRunFlags: boolean[] = layoutIds.map((id) => {
			if (id === null) return false; // no server loader at this depth
			const entry = appState.loaderCache.layouts[id];
			if (!entry) return true; // never loaded → must run
			return shouldRerun(entry, appState.dirty, ctx);
		});

		let pageRun = false;
		if (pageId !== null) {
			const entry = appState.loaderCache.page;
			if (!entry || entry.nodeId !== pageId) {
				pageRun = true;
			} else {
				pageRun = shouldRerun(entry, appState.dirty, ctx);
			}
		}

		// Build `_invalidated=<bits>` — char 0 = page, char i+1 = layouts[i].
		// '1' = run, '0' = skip. Always sent so the server honors cached layers.
		// We always issue the fetch (even when all loaders skip) so page-level
		// metadata stays fresh on every navigation; only the loaders flagged in
		// the mask actually run server-side.
		const maskBits = (pageRun ? "1" : "0") + layoutRunFlags.map((b) => (b ? "1" : "0")).join("");

		// Clear dirty set now — we've baked it into the mask.
		clearDirty();

		// Load components + data in parallel, then update state atomically
		// to avoid a flash of stale/empty data before the fetch completes.
		const cached = match.route.hasServerData ? consumePrefetch(path) : null;
		prefetchCache.clear(); // clear remaining entries on navigation — matches SvelteKit behavior
		// Forward cached parent data for skipped layers so downstream loaders see
		// real parent() data, not {}. POST only when there's something to carry —
		// keeps the no-skip case a cacheable/dedupable GET.
		const snapshots = buildParentSnapshots(path, maskBits);
		const dataInit: RequestInit =
			Object.keys(snapshots).length > 0
				? {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ parentSnapshots: snapshots }),
					}
				: {};
		const dataFetch = cached
			? Promise.resolve(cached)
			: match.route.hasServerData
				? fetch(dataUrl(path, maskBits), dataInit)
						.then((r) => r.json())
						.catch(() => null)
				: Promise.resolve(null);

		const settle = (target: { url: URL; params: Record<string, string> } | null) => {
			const nav: Navigation = {
				from: null,
				to: target,
				type: router.lastNavType,
				willUnload: false,
				cancel: () => {},
			};
			fireAfterNavigate(nav);
			drainNavResolvers();
		};

		Promise.all([
			match.route.page(),
			Promise.all(match.route.layouts.map((l: any) => l())),
			dataFetch,
		]).then(async ([pageMod, layoutMods, result]: [any, any[], any]) => {
			if (cancelled) return;
			navigating = false;
			navDone = true;
			// Tear down the loading skeleton and record identity for the next nav.
			// Superseded navs have cancelled === true and never reach here, so they
			// can't clobber a newer nav's loader.
			showLoading = false;
			LoadingComponent = null;
			currentLayoutPaths = destLayoutPaths;
			lastSettledPath = pathname;
			navDoneTimer = setTimeout(() => {
				navDone = false;
			}, 400);
			if (result?.redirect) {
				router.navigate(result.redirect);
				return;
			}
			if (result?.error || (result === null && match.route.hasServerData)) {
				// New shape: { error: { status, message }, errorDepth, errorOrigin }
				const errInfo = result?.error;
				const errStatus =
					typeof errInfo === "object" && errInfo !== null
						? (errInfo.status ?? 500)
						: (result?.status ?? 500);
				const errMessage =
					typeof errInfo === "object" && errInfo !== null
						? (errInfo.message ?? "Internal Server Error")
						: typeof errInfo === "string"
							? errInfo
							: "Internal Server Error";
				const errDepth: number =
					typeof result?.errorDepth === "number" ? result.errorDepth : match.route.layouts.length;
				const errOrigin = result?.errorOrigin === "layout" ? "layout" : "page";
				const picked = pickErrorPage(match.route.errorPages ?? [], errDepth, errOrigin);
				if (!picked) {
					// No nested boundary — full reload so server can render global error page
					window.location.href = path;
					return;
				}
				try {
					const K = picked.depth;
					const [errMod, ...layoutModsForError] = await Promise.all([
						picked.loader(),
						...match.route.layouts.slice(0, K).map((l: any) => l()),
					]);
					if (cancelled) return;
					layoutComponents = layoutModsForError.map((m: any) => m.default);
					const newLayoutData: Record<string, any>[] = [];
					for (let i = 0; i < K; i++) newLayoutData.push({});
					appState.layoutData = newLayoutData;
					appState.pageData = {};
					appState.routeParams = match.params;
					appState.errorComponent = errMod.default;
					appState.errorProps = { error: { status: errStatus, message: errMessage } };
					appState.errorDepth = K;
					settleScroll();
					settle({ url, params: match.params });
				} catch {
					window.location.href = path;
				}
				return;
			}
			PageComponent = pageMod.default;
			layoutComponents = layoutMods.map((m: any) => m.default);

			// Merge sparse server response with the existing client cache.
			// Slots the server returned null for were intentionally skipped — we
			// must pull their data from the cache to keep rendering correct.
			const respLayoutData: (Record<string, any> | null)[] = result?.layoutData ?? [];
			const respLayoutDeps: (any | null)[] = result?.layoutDeps ?? [];
			const respPageData: Record<string, any> | null | undefined = result?.pageData;
			const respPageDeps: any = result?.pageDeps ?? null;

			const mergedLayoutData: Record<string, any>[] = [];
			for (let i = 0; i < layoutIds.length; i++) {
				const id = layoutIds[i];
				if (id === null) {
					mergedLayoutData.push({});
					continue;
				}
				if (respLayoutData[i] !== null && respLayoutData[i] !== undefined) {
					const entry: CacheEntry = {
						nodeId: id,
						data: respLayoutData[i] as Record<string, any>,
						deps: respLayoutDeps[i] ?? {
							keys: [],
							urls: [],
							params: [],
							searchParams: [],
							cookies: [],
							uses_url: false,
						},
						snapshot: captureSnapshot(
							respLayoutDeps[i] ?? {
								keys: [],
								urls: [],
								params: [],
								searchParams: [],
								cookies: [],
								uses_url: false,
							},
							ctx,
						),
					};
					appState.loaderCache.layouts[id] = entry;
					mergedLayoutData.push(entry.data);
				} else {
					const cachedEntry = appState.loaderCache.layouts[id];
					mergedLayoutData.push(cachedEntry?.data ?? {});
				}
			}

			let mergedPageData: Record<string, any>;
			if (respPageData !== null && respPageData !== undefined) {
				const deps = respPageDeps ?? {
					keys: [],
					urls: [],
					params: [],
					searchParams: [],
					cookies: [],
					uses_url: false,
				};
				const entry: CacheEntry = {
					nodeId: pageId ?? "",
					data: respPageData,
					deps,
					snapshot: captureSnapshot(deps, ctx),
				};
				if (pageId !== null) appState.loaderCache.page = entry;
				mergedPageData = respPageData;
			} else if (appState.loaderCache.page && appState.loaderCache.page.nodeId === pageId) {
				mergedPageData = appState.loaderCache.page.data;
			} else {
				mergedPageData = {};
			}

			appState.pageData = mergedPageData;
			appState.layoutData = mergedLayoutData;
			appState.routeParams = match.params;
			// Successful navigation — clear any prior error state.
			appState.errorComponent = null;
			appState.errorProps = null;
			appState.errorDepth = null;

			settleScroll();

			// Update document title and meta description from server metadata
			if (result?.metadata) {
				if (result.metadata.title) document.title = result.metadata.title;
				if (result.metadata.description) {
					let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
					if (!meta) {
						meta = document.createElement("meta");
						meta.name = "description";
						document.head.appendChild(meta);
					}
					meta.content = result.metadata.description;
				}
			}

			settle({ url, params: match.params });
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<!--
  Nested layout rendering:
  layouts[0] wraps layouts[1] wraps ... wraps PageComponent
-->

{#if navigating}
	<div class="bosia-bar loading"></div>
{:else if navDone}
	<div class="bosia-bar done"></div>
{/if}

{#if showLoading && LoadingComponent}
	{@render renderLoading(0)}
{:else if ErrorComponent}
	{@const depth = errorDepth ?? 0}
	{#if depth > 0 && layoutComponents.length > 0}
		{@render renderLayout(0, depth)}
	{:else}
		<ErrorComponent {...errorProps ?? {}} />
	{/if}
{:else if layoutComponents.length > 0}
	{@render renderLayout(0, layoutComponents.length)}
{:else if PageComponent}
	<PageComponent bind:this={pageInstance} data={pageData} {params} form={formData} />
{:else}
	<p>Loading...</p>
{/if}

{#snippet renderLoading(index: number)}
	{#if index < loadingDepth}
		{@const Layout = layoutComponents[index]}
		{@const data = layoutData[index] ?? {}}
		<Layout {data} {params}>
			{@render renderLoading(index + 1)}
		</Layout>
	{:else}
		<LoadingComponent />
	{/if}
{/snippet}

{#snippet renderLayout(index: number, leafDepth: number)}
	{@const Layout = layoutComponents[index]}
	{@const data = layoutData[index] ?? {}}

	{#if index < leafDepth - 1}
		<Layout {data} {params}>
			{@render renderLayout(index + 1, leafDepth)}
		</Layout>
	{:else}
		<Layout {data} {params}>
			{#if ErrorComponent}
				<ErrorComponent {...errorProps ?? {}} />
			{:else if PageComponent}
				<PageComponent bind:this={pageInstance} data={pageData} {params} form={formData} />
			{:else}
				<p>Loading...</p>
			{/if}
		</Layout>
	{/if}
{/snippet}

<style>
	.bosia-bar {
		position: fixed;
		top: 0;
		left: 0;
		height: 2px;
		width: 100%;
		background: var(--bosia-loading-color, #f73b27);
		z-index: 9999;
		pointer-events: none;
		transform-origin: left center;
	}
	.bosia-bar.loading {
		animation: bosia-load 8s cubic-bezier(0.02, 0.5, 0.5, 1) forwards;
	}
	.bosia-bar.done {
		animation: bosia-done 0.35s ease forwards;
	}
	@keyframes bosia-load {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(0.85);
		}
	}
	@keyframes bosia-done {
		from {
			transform: scaleX(1);
			opacity: 1;
		}
		to {
			transform: scaleX(1);
			opacity: 0;
		}
	}
</style>
