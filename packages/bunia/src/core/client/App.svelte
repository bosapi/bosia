<script lang="ts">
  import { router } from "./router.svelte.ts";
  import { findMatch } from "../matcher.ts";
  import { clientRoutes } from "bunia:routes";

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
    const match = findMatch(clientRoutes, path);
    if (!match) return;

    let cancelled = false;

    const isFirst = firstNav;
    firstNav = false;
    if (!isFirst) {
      formData = null;
      if (navDoneTimer) { clearTimeout(navDoneTimer); navDoneTimer = null; }
      navDone = false;
      navigating = true;
    }

    // Load components + data in parallel, then update state atomically
    // to avoid a flash of stale/empty data before the fetch completes.
    const dataFetch = match.route.hasServerData
      ? fetch(`/__bunia/data?path=${encodeURIComponent(path)}`).then(r => r.json()).catch(() => null)
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
      if (result?.error) {
        window.location.href = path;
        return;
      }
      PageComponent = pageMod.default;
      layoutComponents = layoutMods.map((m: any) => m.default);
      pageData = result?.pageData ?? {};
      layoutData = result?.layoutData ?? [];
      routeParams = result?.pageData?.params ?? match.params;
    });

    return () => { cancelled = true; };
  });
</script>

<!--
  Nested layout rendering:
  layouts[0] wraps layouts[1] wraps ... wraps PageComponent
-->

{#if navigating}
  <div class="bunia-bar loading"></div>
{:else if navDone}
  <div class="bunia-bar done"></div>
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
  .bunia-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background: var(--bunia-loading-color, #f73b27);
    z-index: 9999;
    pointer-events: none;
    transform-origin: left center;
  }
  .bunia-bar.loading {
    animation: bunia-load 8s cubic-bezier(0.02, 0.5, 0.5, 1) forwards;
  }
  .bunia-bar.done {
    animation: bunia-done 0.35s ease forwards;
  }
  @keyframes bunia-load {
    from { transform: scaleX(0); }
    to   { transform: scaleX(0.85); }
  }
  @keyframes bunia-done {
    from { transform: scaleX(1); opacity: 1; }
    to   { transform: scaleX(1); opacity: 0; }
  }
</style>
