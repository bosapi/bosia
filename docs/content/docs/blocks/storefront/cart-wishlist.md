---
title: Storefront — Cart & Wishlist
description: Full-width cart line items, a wishlist grid for favourites, and a shared empty state.
demo: StorefrontCartWishlistDemo
---

The pieces of a dedicated cart page and a wishlist. `cart-lines` renders the bag as full-width
rows, `wishlist-grid` is the first UI for the store's favourites, and both fall back to the shared
`empty-state` when there's nothing to show.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/empty-state
bun x bosia@latest add block storefront/cart-lines
bun x bosia@latest add block storefront/wishlist-grid
```

`cart-lines` and `wishlist-grid` pull `storefront/store` and `storefront/empty-state`; all pull
[`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import CartLines from "$lib/blocks/storefront/cart-lines/block.svelte";
	import WishlistGrid from "$lib/blocks/storefront/wishlist-grid/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<CartLines {cart} />
<WishlistGrid {cart} />
```

`cart-lines` edits the shared cart directly — steppers call `setQty`, remove sets quantity to zero
— and shows the empty state (with an `onContinue` CTA) when the bag is empty. `wishlist-grid`
filters its `products` by the cart's favourites; "Move to bag" adds the item and un-favourites it
(`onMoveToCart` fires after). `empty-state` takes `icon`, `title`, `sub`, `cta` and `onCta` for
standalone use.

## Source

`src/lib/blocks/storefront/{empty-state,cart-lines,wishlist-grid}/block.svelte`
