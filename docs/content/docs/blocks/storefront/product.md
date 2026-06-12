---
title: Storefront — Product Page
description: Sticky gallery, buy box with options, trust row and detail accordions.
demo: StorefrontProductDemo
---

The building blocks of a product detail page (PDP). Lay the gallery and the buy box side by side,
then stack the trust row and accordions beneath the options.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/product-gallery
bun x bosia@latest add block storefront/product-options
bun x bosia@latest add block storefront/trust-row
bun x bosia@latest add block storefront/pdp-accordions
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

## Source

`src/lib/blocks/storefront/{product-gallery,product-options,trust-row,pdp-accordions}/block.svelte`
