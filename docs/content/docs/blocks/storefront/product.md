---
title: Storefront — Product Page
description: Sticky gallery, buy box with options, trust row, detail accordions and reviews.
demo: StorefrontProductDemo
---

The building blocks of a product detail page (PDP). Lay the gallery and the buy box side by side,
stack the trust row and accordions beneath the options, then finish with the reviews section.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/product-gallery
bun x bosia@latest add block storefront/product-options
bun x bosia@latest add block storefront/trust-row
bun x bosia@latest add block storefront/pdp-accordions
bun x bosia@latest add block storefront/reviews
```

`product-options` pulls `storefront/store`; all pull [`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import ProductGallery from "$lib/blocks/storefront/product-gallery/block.svelte";
	import ProductOptions from "$lib/blocks/storefront/product-options/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<div class="grid lg:grid-cols-[1.1fr_1fr] gap-12">
	<ProductGallery />
	<ProductOptions {cart} />
</div>
```

`product-options` takes a `product`, optional `sizes`, and a shared `cart` (add-to-bag totals the
selected quantity). `pdp-accordions` uses native `<details>` for the detail sections.

`reviews` renders standalone with sample reviews, or pass your own: `rating`, `count`,
`distribution` (percent per star, 5→1) and `reviews` (`{ author, rating, date, title?, body,
verified? }`). Its write-a-review form appends to the visible list and fires `onSubmit(review)`
for real persistence.

## Source

`src/lib/blocks/storefront/{product-gallery,product-options,trust-row,pdp-accordions,reviews}/block.svelte`
