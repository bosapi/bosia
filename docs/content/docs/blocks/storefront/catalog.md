---
title: Storefront — Catalog & Cart
description: Product card and grid, featured collection, the shared cart store and the cart drawer.
demo: StorefrontCatalogDemo
---

The product pieces, all wired to one shared cart. The `storefront/store` module is a Svelte 5 runes
store (cart, favourites, drawer flag) with localStorage persistence and a sample catalogue —
create one instance and pass it down.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/product-card
bun x bosia@latest add block storefront/product-grid
bun x bosia@latest add block storefront/featured-collection
bun x bosia@latest add block storefront/cart-drawer
```

Installing any of these pulls `storefront/store` automatically. `product-grid` includes
`product-card`; `featured-collection` wraps `product-grid` with a heading.

## Usage

```svelte
<script lang="ts">
	import FeaturedCollection from "$lib/blocks/storefront/featured-collection/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart, sampleProducts } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<FeaturedCollection products={sampleProducts} {cart} />
<CartDrawer {cart} />
```

Pass the same `cart` to the header, every grid, and the drawer to keep them in sync. Without a
`cart`, each block falls back to local state so it still renders standalone. The drawer is
`position: fixed` and opens when an item is added (or via `cart.open = true`).

## Source

`src/lib/blocks/storefront/{store,product-card,product-grid,featured-collection,cart-drawer}/`
