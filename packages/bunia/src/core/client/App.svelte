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
  }: {
    ssrMode?: boolean;
    ssrPageComponent?: any;
    ssrLayoutComponents?: any[];
    ssrPageData?: Record<string, any>;
    ssrLayoutData?: Record<string, any>[];
  } = $props();

  let PageComponent = $state<any>(ssrPageComponent);
  let layoutComponents = $state<any[]>(ssrLayoutComponents ?? []);
  let pageData = $state<Record<string, any>>(ssrPageData ?? {});
  let layoutData = $state<Record<string, any>[]>(ssrLayoutData ?? []);
  // Kept separate to avoid a read→write cycle inside the $effect below
  let routeParams = $state<Record<string, string>>(ssrPageData?.params ?? {});

  $effect(() => {
    if (ssrMode) return;

    const path = router.currentRoute;
    const match = findMatch(clientRoutes, path);
    if (!match) return;

    let cancelled = false;

    // Load components + data in parallel, then update state atomically
    // to avoid a flash of stale/empty data before the fetch completes.
    const dataFetch = match.route.hasServerData
      ? fetch(`/__bunia/data?path=${encodeURIComponent(path)}`).then(r => r.ok ? r.json() : null).catch(() => null)
      : Promise.resolve(null);

    Promise.all([
      match.route.page(),
      Promise.all(match.route.layouts.map((l: any) => l())),
      dataFetch,
    ]).then(([pageMod, layoutMods, result]: [any, any[], any]) => {
      if (cancelled) return;
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

{#if layoutComponents.length > 0}
  {@render renderLayout(0)}
{:else if PageComponent}
  <PageComponent data={{ ...pageData, params: routeParams }} />
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
        <PageComponent data={{ ...pageData, params: routeParams }} />
      {:else}
        <p>Loading...</p>
      {/if}
    </Layout>
  {/if}
{/snippet}
