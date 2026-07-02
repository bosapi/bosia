---
title: Pages — Storefront Wishlist
description: Wishlist page with a grid of favourited products, move-to-bag and an empty state.
demo: PagesWishlistDemo
---

The Mercato wishlist: header, a grid of favourited products with a "Move to bag" action, an empty
state once the list is cleared, a newsletter section, and the shared cart drawer.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/wishlist
```

Installs `page.svelte` plus the storefront blocks it composes.

## Usage

```svelte
<script lang="ts">
	import Wishlist from "$lib/pages/storefront/wishlist/page.svelte";
</script>

<Wishlist />
```

A few favourites are seeded on first visit. "Move to bag" adds the item to the cart, opens the
drawer, and removes it from the list; hearting a product from any other page adds it here —
favourites persist in `localStorage` via the shared store.

## Source

`src/lib/pages/storefront/wishlist/page.svelte`
