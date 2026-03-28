<script lang="ts">
  import { router } from "./router.svelte.ts";
  import { findMatch } from "../matcher.ts";
  import { clientRoutes } from "bosia:routes";
  import { consumePrefetch, prefetchCache } from "./prefetch.ts";

  let {
    ssrMode = false,
    ssrPageComponent = null,
    ssrLayoutComponents = [],
    ssrPageData = {},
    ssrLayoutData = [],
    ssrFormData = null,
  }: {
    ssrMode?: boolean;
    ssrPageComponent?: any;
    ssrLayoutComponents?: any[];
    ssrPageData?: Record<string, any>;
    ssrLayoutData?: Record<string, any>[];
    ssrFormData?: any;
  } = $props();

  let PageComponent = $state<any>(ssrPageComponent);
  let layoutComponents = $state<any[]>(ssrLayoutComponents ?? []);
  let pageData = $state<Record<string, any>>(ssrPageData ?? {});
  let layoutData = $state<Record<string, any>[]>(ssrLayoutData ?? []);
  // Kept separate to avoid a read→write cycle inside the $effect below
  let routeParams = $state<Record<string, string>>(ssrPageData?.params ?? {});
  let formData = $state<any>(ssrFormData);
  let navigating = $state(false);
  let navDone = $state(false);
  // Skip bar on the very first effect run (initial hydration — data already present)
  let firstNav = true;
  let navDoneTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (ssrMode) return;

    const path = router.currentRoute;
    const pathname = path.split("?")[0].split("#")[0];
    const match = findMatch(clientRoutes, pathname);
    if (!match) return;

    let cancelled = false;

    const isFirst = firstNav;
    firstNav = false;
    if (isFirst) return; // Initial hydration — data already in SSR props, no fetch needed

    formData = null;
    if (navDoneTimer) { clearTimeout(navDoneTimer); navDoneTimer = null; }
    navDone = false;
    navigating = true;

    // Load components + data in parallel, then update state atomically
    // to avoid a flash of stale/empty data before the fetch completes.
    const cached = match.route.hasServerData ? consumePrefetch(path) : null;
    prefetchCache.clear(); // clear remaining entries on navigation — matches SvelteKit behavior
    const dataFetch = cached
      ? Promise.resolve(cached)
      : match.route.hasServerData
        ? fetch(`/__bosia/data?path=${encodeURIComponent(path)}`).then(r => r.json()).catch(() => null)
        : Promise.resolve(null);

    Promise.all([
      match.route.page(),
      Promise.all(match.route.layouts.map((l: any) => l())),
      dataFetch,
    ]).then(([pageMod, layoutMods, result]: [any, any[], any]) => {
      if (cancelled) return;
      navigating = false;
      navDone = true;
      navDoneTimer = setTimeout(() => { navDone = false; }, 400);
      if (result?.redirect) {
        router.navigate(result.redirect);
        return;
      }
      if (result?.error || (result === null && match.route.hasServerData)) {
        // Data fetch failed (e.g. static hosting with no server) — full page load
        window.location.href = path;
        return;
      }
      PageComponent = pageMod.default;
      layoutComponents = layoutMods.map((m: any) => m.default);
      pageData = result?.pageData ?? {};
      layoutData = result?.layoutData ?? [];
      routeParams = result?.pageData?.params ?? match.params;

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
    });

    return () => { cancelled = true; };
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

{#if layoutComponents.length > 0}
  {@render renderLayout(0)}
{:else if PageComponent}
  <PageComponent data={{ ...pageData, params: routeParams }} form={formData} />
{:else}
  <p>Loading...</p>
{/if}

{#snippet renderLayout(index: number)}
  {@const Layout = layoutComponents[index]}
  {@const data = layoutData[index] ?? {}}

  {#if index < layoutComponents.length - 1}
    <Layout {data}>
      {@render renderLayout(index + 1)}
    </Layout>
  {:else}
    <Layout {data}>
      {#if PageComponent}
        <PageComponent data={{ ...pageData, params: routeParams }} form={formData} />
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
    from { transform: scaleX(0); }
    to   { transform: scaleX(0.85); }
  }
  @keyframes bosia-done {
    from { transform: scaleX(1); opacity: 1; }
    to   { transform: scaleX(1); opacity: 0; }
  }
</style>
