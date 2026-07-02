---
title: Pages — Storefront Product
description: Product detail page with gallery, buy box, trust signals, reviews and a related collection.
demo: PagesProductDemo
---

The Mercato product detail page (PDP): header, breadcrumb, sticky gallery, buy box with options,
trust row, detail accordions, a reviews section, a related collection, and the shared cart drawer.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/product
```

Installs `page.svelte` plus the storefront blocks it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Product from "$lib/pages/storefront/product/page.svelte";
</script>

<Product />
```

The page uses the first catalogue item as the product and the next few as the related collection.
Adding to bag totals the selected quantity and opens the cart drawer.

## Source

`src/lib/pages/storefront/product/page.svelte`
