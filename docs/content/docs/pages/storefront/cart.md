---
title: Pages — Storefront Cart
description: Cart page with line items, quantity steppers, a sticky order summary and an empty state.
demo: PagesCartDemo
---

The Mercato cart page: header, full-width line items with quantity steppers and remove, a sticky
order summary with promo code and a "Checkout" CTA, an empty state when the bag is cleared, and a
related collection.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/cart
```

Installs `page.svelte` plus the storefront blocks it composes.

## Usage

```svelte
<script lang="ts">
	import Cart from "$lib/pages/storefront/cart/page.svelte";
</script>

<Cart />
```

The bag is seeded from the catalogue on first visit; shipping is free over $50. Clearing every line
swaps in the empty state, and the related collection suggests items not already in the bag.

## Source

`src/lib/pages/storefront/cart/page.svelte`
