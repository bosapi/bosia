---
title: Storefront — Listing
description: Filter sidebar and sort bar for a product listing page.
demo: StorefrontListingDemo
---

The controls for a category / product listing page (PLP). Combine with `product-grid` to build the
full listing — see the [listing page](/pages/storefront/listing).

## Preview

## Install

```bash
bun x bosia@latest add block storefront/filter-sidebar
bun x bosia@latest add block storefront/sort-bar
```

`sort-bar` pulls [`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import SortBar from "$lib/blocks/storefront/sort-bar/block.svelte";
	import FilterSidebar from "$lib/blocks/storefront/filter-sidebar/block.svelte";

	let sort = $state("Featured");
</script>

<SortBar title="All products" count={24} bind:sort />
<FilterSidebar categories={["Home", "Kitchen", "Pantry"]} />
```

`sort-bar` exposes a bindable `sort` so the parent can reorder its grid. `filter-sidebar` keeps its
selections in local state — read them or lift them up as needed.

## Source

`src/lib/blocks/storefront/filter-sidebar/block.svelte` · `src/lib/blocks/storefront/sort-bar/block.svelte`
