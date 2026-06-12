---
title: Pages — Storefront Home
description: Multi-purpose storefront homepage composed from storefront blocks.
demo: PagesHomeDemo
---

The Mercato homepage: header, hero, category tiles, featured collection, value row, promo,
editorial, testimonials, newsletter, footer, and a shared cart drawer.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/home
```

Installs `page.svelte` plus every storefront block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Home from "$lib/pages/storefront/home/page.svelte";
</script>

<Home />
```

Change the store purpose by editing the `purpose` constant at the top of `page.svelte` (see the
[overview](/pages/overview)); pair it with the matching theme. One `createCart()` is shared by the
header, the featured collection and the cart drawer.

## Source

`src/lib/pages/storefront/home/page.svelte`
