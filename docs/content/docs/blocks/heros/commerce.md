---
title: Heros — Commerce
description: Full-bleed storefront hero sections for product, sale, and category pages.
demo: HerosCommerceDemo
---

Seven e-commerce hero sections — split product layouts, a full-bleed sale countdown, fanned
bookstore covers, a playful toy grid, and lifestyle photo heroes. The brand colour maps to
`--primary`, so every emphasized word, CTA, and badge follows the active theme.

## Preview

## Install

Each hero installs on its own:

```bash
bun x bosia@latest add block heros/shop-split
bun x bosia@latest add block heros/sale
bun x bosia@latest add block heros/bags
bun x bosia@latest add block heros/bookstore
bun x bosia@latest add block heros/toys
bun x bosia@latest add block heros/home-goods
bun x bosia@latest add block heros/apparel
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import ShopSplit from "$lib/blocks/heros/shop-split/block.svelte";
</script>

<ShopSplit />
```

Heroes are full-width `<section>` blocks — drop one at the top of a route. Interactive bits
(size picker on `apparel`, age filter on `toys`) are cosmetic local `$state`; wire them to your
own data. Edit `block.svelte` to swap copy and the Unsplash images.
