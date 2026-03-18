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

    routeParams = match.params;

    match.route.page().then((mod: any) => {
      PageComponent = mod.default;
    });

    Promise.all(match.route.layouts.map((l: any) => l())).then((mods: any[]) => {
      layoutComponents = mods.map((m) => m.default);
    });
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
