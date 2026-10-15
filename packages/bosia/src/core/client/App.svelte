<script lang="ts">
	import { tick } from "svelte";
	import { router, scrollToHash } from "./router.svelte.ts";
	import { findMatch } from "../matcher.ts";
	import { clientRoutes, defaultTitle } from "bosia:routes";
	import { consumePrefetch, clearPrefetches, dataUrl, readDataResponse } from "./prefetch.ts";
	import { appState, clearDirty } from "./appState.svelte.ts";
	import { captureSnapshot, liveContext, shouldRerun, type CacheEntry } from "./loaderCache.ts";
	import { pickErrorPage } from "../errorMatch.ts";
	import { fireAfterNavigate, type Navigation } from "./navListeners.ts";
	import { drainNavResolvers } from "./navigation.ts";
	import { collapseTitle, errorTitle } from "../headScan.ts";
	import { chainTitles, takeTitleWrite, titleNav } from "./titleMemory.svelte.ts";
	import TitleProbe from "./TitleProbe.svelte";

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
	// Mounted page instance. Exposes `export const snapshot`.
	let pageInstance = $state<any>(null);
	if (!ssrMode) router.getPageSnapshot = () => pageInstance?.snapshot;

	// The last title navigation (or SSR's metadata()) wrote, as document.title
	// reads it. Same page, same title still → no component took it over, so
	// navigation may replace it again.
	let navTitle: string | null = null;

	// Build-time titles are raw HTML text; a <textarea> decodes every entity the
	// way the browser did on a hard load. Trusted Types block the innerHTML
	// write, so the raw text is the fallback there.
	const decoded = new Map<string, string>();
	function decodeTitle(raw: string): string {
		let text = decoded.get(raw);
		if (text === undefined) {
			try {
				const t = document.createElement("textarea");
				t.innerHTML = raw;
				text = collapseTitle(t.value);
			} catch {
				text = collapseTitle(raw);
			}
			decoded.set(raw, text);
		}
		return text;
	}

	/** The title a page with none of its own shows under the first `depth`
	 *  layouts: the deepest one's that wrote one (TitleProbe), else app.html's. */
	function baseTitle(depth: number): string {
		return (depth > 0 ? chainTitles[depth - 1] : null) ?? decodeTitle(defaultTitle);
	}

	/** How many leading layouts two routes share, by file path. */
	function sharedDepth(a: string[], b: string[]): number {
		let s = 0;
		while (s < a.length && s < b.length && a[s] === b[s]) s++;
		return s;
	}

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
	// How many layouts wrap the leaf: the shared ones under a skeleton, the error's depth.
	const outerDepth = $derived(
		showLoading && LoadingComponent
			? Math.min(loadingDepth, layoutComponents.length)
			: ErrorComponent
				? Math.min(errorDepth ?? 0, layoutComponents.length)
				: layoutComponents.length,
	);
	let currentLayoutPaths: string[] = [];
	let lastSettledPath = "";
	let lastNavKey = ""; // pathname + search of the last processed nav
	let seenRoute = ""; // full route (with hash) the nav effect last ran for
	let navPending = false; // a route change not yet scrolled for; outlives superseded/redirected runs
	let lastTick = 0; // invalidationTick value last processed
	// An invalidated run that was cancelled or redirected before applying its data
	// already cleared the dirty set, so the next run refetches every loader instead.
	let owedRefresh = false;
	// Skip bar on the very first effect run (initial hydration — data already present)
	let firstNav = true;
	let navDoneTimer: ReturnType<typeof setTimeout> | null = null;

	// Scroll after a nav settles: forward navs go to top (or the URL hash);
	// back/forward navs restore the position saved for that history entry.
	// Runs after tick() so the destination page's real height is in the DOM.
	// goto({ noScroll: true }) flips `router.suppressScroll` for one nav.
	// A re-run with no route change (`invalidate*()`, `use:enhance`) isn't a nav and
	// keeps its scroll — unless `replaced`: an error page and the page swapped places.
	// A run that ends without settling (no route, a redirect that didn't start a nav,
	// a rejected chain): drop the loading UI and the scroll it owed, and release
	// waiting goto()/use:enhance calls.
	function dropLoadingUI() {
		navigating = false;
		showLoading = false;
		LoadingComponent = null;
	}
	function abandonRun(scrolled?: Promise<void>) {
		dropLoadingUI();
		router.loading = false;
		navPending = false;
		router.suppressScroll = false;
		drainNavResolvers(scrolled);
	}

	// Full GET load of `path`, which the address bar already shows. reload() could
	// re-POST an entry a native form submit made; href= the same URL with a #hash
	// would only scroll — so drop the hash.
	function hardLoad(path: string) {
		// replace: the entry being reloaded is this one, so no extra history entry.
		window.location.replace(path.split("#")[0]);
	}

	// Returns the pending scroll: goto()/use:enhance waiters resume after it, so a
	// scrollTo() right after `await goto()` isn't overwritten.
	function settleScroll(replaced = false): Promise<void> | undefined {
		const navigated = navPending;
		navPending = false;
		let scrolled: Promise<void> | undefined;
		if (!navigated) {
			if (replaced) scrolled = tick().then(() => window.scrollTo(0, 0));
		} else if (router.isPush && !router.suppressScroll) {
			const hash = window.location.hash;
			scrolled = tick().then(() => {
				if (!scrollToHash(hash)) window.scrollTo(0, 0);
			});
		} else if (!router.isPush) {
			const pos = router.pendingScroll;
			// single post-tick restore; content that loads later (images
			// without dimensions) can still shift it. Revisit only if reported.
			if (pos) scrolled = tick().then(() => window.scrollTo(pos.x, pos.y));
		}
		router.pendingScroll = null;
		router.suppressScroll = false;
		settleSnapshot();
		return scrolled;
	}

	// Each flush a navigation starts begins here, before any head effect: what
	// was written since — navigation's own title, an afterNavigate listener's,
	// the last page's — is no layout's, so the probes must not take it.
	$effect.pre(() => {
		if (ssrMode) return;
		titleNav.seq;
		takeTitleWrite();
	});

	$effect(() => {
		if (ssrMode) return;

		// Subscribe to `invalidationTick` so `invalidate()` can wake the effect
		// without a URL change.
		const currentTick = appState.invalidationTick; // still tracks reactively

		const path = router.currentRoute;
		const url = new URL(path, window.location.origin);
		const pathname = url.pathname;
		const navKey = pathname + url.search;
		const match = findMatch(clientRoutes, pathname);
		if (!match) {
			// No client route: a server-rendered 404, or Back onto one. Moving onto it
			// needs the server to render it; a refresh on it just releases waiters.
			const moved = !firstNav && path.split("#")[0] !== seenRoute.split("#")[0];
			firstNav = false; // a 404 hydrated nothing, so the next match is a real nav
			seenRoute = path;
			if (moved) hardLoad(path);
			else abandonRun();
			return;
		}

		let cancelled = false;

		const isFirst = firstNav;
		firstNav = false;
		if (isFirst) {
			const hUrl = new URL(router.hydratedRoute, window.location.origin);
			const hMatch = router.hydratedRoute === path ? match : findMatch(clientRoutes, hUrl.pathname);
			currentLayoutPaths = (hMatch?.route as any)?.layoutPaths ?? [];
			// The probes ran during hydration, before this effect. A title other than
			// metadata()'s or the layouts' was a component's, so navigation keeps it.
			const ssrTitle: string | undefined = (window as any).__BOSIA_TITLE__;
			const base = baseTitle(currentLayoutPaths.length);
			navTitle = ssrTitle ? collapseTitle(ssrTitle) : document.title === base ? base : null;
			lastSettledPath = hUrl.pathname;
			lastNavKey = hUrl.pathname + hUrl.search;
			seenRoute = router.hydratedRoute;
			lastTick = 0; // the SSR data's tick
			// Restore-after-reload: router.init() staged this entry's snapshot. Only for
			// the hydrated page — a nav during hydration staged the destination's.
			if (path === router.hydratedRoute) settleSnapshot();
			// Initial hydration — data already in SSR props, no fetch needed. Unless a
			// child's onMount (its effects run first) already invalidated or navigated:
			// then fall through and run it as a normal nav from the server's route.
			if (currentTick === 0 && path === router.hydratedRoute) {
				router.loading = false; // a nav away and back before this run started
				return;
			}
		}

		// Decided here, not at settle: a run superseded or redirected before it
		// settles still owes the scroll its route change asked for.
		if (path !== seenRoute) navPending = true;
		seenRoute = path;

		// Hash-only change (same pathname+search, no invalidation): scroll, don't
		// refetch. A static host can't answer the parent-snapshot POST a refetch may
		// issue, which would otherwise render the error page.
		if (navKey === lastNavKey && currentTick === lastTick && !owedRefresh) {
			// Back to the settled page before an in-flight nav finished: its run was
			// cancelled, so drop the loading UI it left up. goto("#x") waits on this nav
			// like any other, so abandonRun() releases it too.
			abandonRun(settleScroll());
			return;
		}
		// A prefetch saved before an invalidation holds pre-mutation data — after a
		// `use:enhance` success or `invalidate*()` it must not stand in for the refetch.
		const carried = owedRefresh;
		const invalidated = currentTick !== lastTick || appState.dirty.all || carried;
		if (invalidated) owedRefresh = true;
		lastTick = currentTick;

		// Only a real navigation drops the action result. An invalidation re-run
		// (same URL, new tick) is how `use:enhance` refreshes the page after a
		// successful action — clearing here wiped the `form` it had just set.
		if (navKey !== lastNavKey) appState.form = null;
		if (navDoneTimer) {
			clearTimeout(navDoneTimer);
			navDoneTimer = null;
		}
		navDone = false;
		navigating = true;
		router.loading = true;

		// ─── +loading.svelte skeleton ─────────────────────────────────────
		// On a real path change, show the destination's loading skeleton nested
		// inside the layouts shared with the current page. The destination's own
		// added layouts aren't mounted yet, so the skeleton draws that chrome.
		const destLayoutPaths = ((match.route as any).layoutPaths as string[]) ?? [];
		const loadingImport = (match.route as any).loading as (() => Promise<any>) | null;
		if (loadingImport && pathname !== lastSettledPath) {
			const s = sharedDepth(currentLayoutPaths, destLayoutPaths);
			loadingImport()
				.then((m) => {
					if (cancelled || !navigating) return; // superseded, or already settled/abandoned
					loadingDepth = s;
					LoadingComponent = m.default;
					showLoading = true;
				})
				// No skeleton is no reason to fail the nav — and a stale chunk here must not
				// reach hydrate.ts's reload while the page itself loaded fine.
				.catch(() => {});
		}

		// ─── Loader cache: decide which loaders need to re-run ─────────────
		// For each layout depth + the page, compare the cached entry (if any)
		// against the live URL/params and the dirty set. If everything is
		// cacheable, skip the fetch entirely.
		const ctx = liveContext(pathname, match.params, url);
		const layoutIds = (match.route as any).layoutIds as (string | null)[];
		const pageId = (match.route as any).pageId as string | null;

		const layoutRunFlags: boolean[] = layoutIds.map((id) => {
			if (id === null) return false; // no server loader at this depth
			const entry = appState.loaderCache.layouts[id];
			if (!entry || carried) return true; // never loaded, or owed a refresh → must run
			return shouldRerun(entry, appState.dirty, ctx);
		});

		let pageRun = false;
		if (pageId !== null) {
			const entry = appState.loaderCache.page;
			if (!entry || entry.nodeId !== pageId || carried) {
				pageRun = true;
			} else {
				pageRun = shouldRerun(entry, appState.dirty, ctx);
			}
		}

		// Build `_invalidated=<bits>` — char 0 = page, char i+1 = layouts[i].
		// '1' = send, '0' = omit (the client renders that layer from its cache;
		// the server still runs layout loaders, which may be guards).
		// We always issue the fetch (even when every layer is cached) so page-level
		// metadata stays fresh on every navigation.
		const maskBits = (pageRun ? "1" : "0") + layoutRunFlags.map((b) => (b ? "1" : "0")).join("");

		// An invalidate() since the last nav — tick bump or any dirty entry —
		// must read past the server's response cache, not just re-run loaders.
		const fresh =
			invalidated ||
			appState.dirty.keys.size > 0 ||
			appState.dirty.urls.size > 0 ||
			appState.dirty.urlMatchers.length > 0;

		// Clear dirty set now — we've baked it into the mask.
		clearDirty();

		// Load components + data in parallel, then update state atomically
		// to avoid a flash of stale/empty data before the fetch completes.
		// `fresh` covers `invalidated` plus dirty keys/URLs: a prefetch sent before
		// an invalidate() skipped `_fresh`, so it may hold the server's stale copy.
		const cached = match.route.hasServerData && !fresh ? consumePrefetch(path, maskBits) : null;
		clearPrefetches(); // clear remaining entries on navigation — matches SvelteKit behavior
		// A prerendered route's data is a fixed file, so there is nothing to omit.
		const prerendered = match.route.prerender;
		const fetchData = () =>
			fetch(dataUrl(path, prerendered ? undefined : maskBits, fresh && !prerendered))
				.then(readDataResponse)
				// Only a failed request reaches here now — offline, DNS, aborted.
				// A response that arrived is read for what it says, not discarded.
				.catch(() => null);
		const dataFetch = cached
			? // A prefetch still in flight: wait for it; fetch again if it failed or
				// errored (a hover-time 500 shouldn't stand in for the click's answer).
				cached instanceof Promise
				? cached.then((data) => (data && !data.error ? data : fetchData()))
				: Promise.resolve(cached)
			: match.route.hasServerData
				? fetchData()
				: Promise.resolve(null);

		// Scrolls first: waiting goto()/use:enhance calls resume after the scroll.
		const settle = (
			target: { url: URL; params: Record<string, string> } | null,
			replaced: boolean,
		) => {
			const scrolled = settleScroll(replaced);
			const nav: Navigation = {
				from: null,
				to: target,
				type: router.lastNavType,
				willUnload: false,
				cancel: () => {},
			};
			// Cleared here, not with the loading UI: an error chunk await or a redirect
			// hop is still loading for a goto() to the same URL.
			router.loading = false;
			// Drain first: a goto() an afterNavigate listener starts must wait for its own
			// nav. Awaiters still resume after the listeners — resolve() is async.
			drainNavResolvers(scrolled);
			fireAfterNavigate(nav);
		};

		Promise.all([
			match.route.page(),
			Promise.all(match.route.layouts.map((l: any) => l())),
			dataFetch,
		])
			.then(async ([pageMod, layoutMods, result]: [any, any[], any]) => {
				if (cancelled) return;
				navigating = false;
				navDone = true;
				// Tear down the loading skeleton and record identity for the next nav.
				// Superseded navs have cancelled === true and never reach here, so they
				// can't clobber a newer nav's loader.
				// The skeleton and the error page take the page's slot in the leaf {#if}, so
				// leaving either remounts the page. Read before both are cleared below.
				// The skeleton shows only once its chunk loaded (template's condition).
				const skeletonShown = showLoading && !!LoadingComponent;
				const pageShown = !skeletonShown && !appState.errorComponent;
				const errorShown = skeletonShown ? null : appState.errorComponent;
				dropLoadingUI();
				navDoneTimer = setTimeout(() => {
					navDone = false;
				}, 400);
				if (result?.redirect) {
					// A redirect that doesn't start a nav (cancelled, same URL, left the app)
					// gets no run to settle it — release the waiting goto()/use:enhance here.
					// owedRefresh stays set: the destination owes this run's invalidation.
					// Replace: Back must skip the redirecting URL, not bounce off it again.
					// navigate() resets suppressScroll; a noScroll goto keeps it through its redirect.
					// The hop is a cancellable push nav: Back/hydration hand it on as "goto".
					const keepNoScroll = router.suppressScroll;
					const from = router.lastNavType;
					const r = router.navigate(result.redirect, {
						replace: true,
						source: from === "popstate" || from === "enter" ? "goto" : from,
					});
					if (r === "started") {
						router.suppressScroll = keepNoScroll;
						// The target may be the page already shown (/admin → /): forget the
						// settled key so it runs as a real nav, not the hash-only shortcut.
						lastNavKey = "";
					} else abandonRun();
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
						hardLoad(path);
						return;
					}
					try {
						const K = picked.depth;
						const [errMod, ...layoutModsForError] = await Promise.all([
							picked.loader(),
							...match.route.layouts.slice(0, K).map((l: any) => l()),
						]);
						if (cancelled) return;
						// The layouts both routes share stay mounted (one render tree) and
						// never write their title again. Same error component under all of
						// them too: nothing remounts, so a <title> it wrote stays — keep it.
						const kept = sharedDepth(currentLayoutPaths, destLayoutPaths.slice(0, K));
						const prev = appState.errorProps?.error;
						const keepTitle =
							errorShown === errMod.default &&
							kept === K &&
							appState.errorDepth === K &&
							!!prev &&
							document.title !== collapseTitle(errorTitle(prev.status, prev.message));
						layoutComponents = layoutModsForError.map((m: any) => m.default);
						currentLayoutPaths = destLayoutPaths.slice(0, K);
						titleNav.seq++; // the probes read again as this flushes
						const newLayoutData: Record<string, any>[] = [];
						for (let i = 0; i < K; i++) newLayoutData.push({});
						appState.layoutData = newLayoutData;
						appState.pageData = {};
						appState.routeParams = match.params;
						appState.errorComponent = errMod.default;
						appState.errorProps = { error: { status: errStatus, message: errMessage } };
						appState.errorDepth = K;
						// What a hard load shows (renderer.ts): a layout's title, else the
						// status title. Set before Svelte flushes, so a freshly mounted
						// <title> in +error.svelte or a layout still wins.
						document.querySelectorAll("[data-bosia-meta]").forEach((el) => el.remove());
						if (!keepTitle) {
							document.title =
								(kept > 0 ? chainTitles[kept - 1] : null) ?? errorTitle(errStatus, errMessage);
							navTitle = document.title;
						}
						// Recorded only once something renders for it (here after the error
						// chunk's await): a cancelled or redirected run never counts as settled.
						lastSettledPath = pathname;
						lastNavKey = navKey;
						settle({ url, params: match.params }, !errorShown);
					} catch {
						if (!cancelled) hardLoad(path);
					}
					return;
				}
				// Fresh data is applied below; the error branch above applied none, so it
				// left any owed refresh for the next run.
				owedRefresh = false;
				lastSettledPath = pathname;
				lastNavKey = navKey;
				// Layout paths are recorded only once they render: a redirect above
				// leaves the mounted ones in place.
				const shared = sharedDepth(currentLayoutPaths, destLayoutPaths);
				currentLayoutPaths = destLayoutPaths;
				const pageChanged = !pageShown || PageComponent !== pageMod.default;
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

				// Re-emit the head from server metadata. `data-bosia-meta` (html.ts `OWNED`)
				// marks exactly the tags metadata() owns, so headExtras, the framework's own
				// static tags and <svelte:head> output are never touched. `result === null`
				// with server data means the fetch failed — leave the head as it is; without
				// server data there is no metadata() at all, so clearing matches SSR.
				if (result || !match.route.hasServerData) {
					const md = result?.metadata;
					document.querySelectorAll("[data-bosia-meta]").forEach((el) => el.remove());
					// With no metadata() title, a page gets the one a hard load would give
					// it: the layouts' (baseTitle), else app.html's <title>, else "Bosia
					// App". A layout that stays mounted never writes its title again, so it
					// is put back here. Set before Svelte flushes, so a freshly mounted
					// <svelte:head><title> still wins. On the same page (invalidate, a form
					// action, ?page=2) it stays once a component like <Seo> took it over.
					if (md?.title) {
						document.title = md.title;
						navTitle = document.title;
					} else if (pageChanged || document.title === navTitle) {
						document.title = baseTitle(shared);
						navTitle = document.title;
					}
					if (md?.lang) document.documentElement.lang = md.lang;
					const emit = (tag: "meta" | "link", attrs: Record<string, string | undefined>) => {
						const el = document.createElement(tag);
						for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
						el.setAttribute("data-bosia-meta", "");
						document.head.appendChild(el);
					};
					if (md?.description) emit("meta", { name: "description", content: md.description });
					for (const m of md?.meta ?? [])
						emit("meta", { name: m.name, property: m.property, content: m.content });
					for (const l of md?.link ?? [])
						emit("link", { rel: l.rel, href: l.href, hreflang: l.hreflang });
				}
				titleNav.seq++; // the probes read again as this flushes

				settle({ url, params: match.params }, !pageShown);
			})
			.catch((err) => {
				// A rejected chunk or a throwing page module: tear down this run's loading UI
				// and release waiting goto()/use:enhance calls, then rethrow — a stale-deploy
				// chunk error must still reach hydrate.ts's unhandledrejection recovery.
				// A run the user already left must not trigger hydrate.ts's reload of the
				// page they're on now; navigating there again retries the chunk.
				if (cancelled) return;
				abandonRun();
				throw err;
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

<!-- One tree for page, error and skeleton: a layout at the same depth stays mounted
  whichever of them it wraps, so its state (an open sidebar) survives the skeleton. -->
{@render renderTree(0)}

{#snippet renderTree(index: number)}
	{#if index < outerDepth}
		{@const Layout = layoutComponents[index]}
		{@const data = layoutData[index] ?? {}}
		<Layout {data} {params}>
			<TitleProbe depth={index} layout={Layout} />
			{@render renderTree(index + 1)}
		</Layout>
	{:else if showLoading && LoadingComponent}
		<LoadingComponent />
	{:else if ErrorComponent}
		<ErrorComponent {...errorProps ?? {}} {params} />
	{:else if PageComponent}
		<PageComponent bind:this={pageInstance} data={pageData} {params} form={formData} />
	{:else}
		<p>Loading...</p>
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
