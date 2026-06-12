---
title: Pages — Storefront Listing
description: Product listing page with filters, sort and a responsive grid.
demo: PagesListingDemo
---

The Mercato product listing page (PLP): header, breadcrumb and sort bar, a sticky filter sidebar,
and a sortable product grid wired to the shared cart.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/listing
```

Installs `page.svelte` plus the storefront blocks it composes.

## Usage

```svelte
<script lang="ts">
	import Listing from "$lib/pages/storefront/listing/page.svelte";
</script>

<Listing />
```

The page binds the sort bar's value and re-sorts the grid (featured, price, top rated). Filters keep
their own local state — wire them to your data when you connect a real catalogue.

## Source

`src/lib/pages/storefront/listing/page.svelte`
