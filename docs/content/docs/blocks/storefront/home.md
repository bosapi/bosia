---
title: Storefront — Home Sections
description: Category tiles, value row, promo banner and strip, editorial, testimonials and newsletter.
demo: StorefrontHomeDemo
---

The marketing sections that make up a storefront homepage. Each is a self-contained, prop-driven
`<section>` using semantic tokens, so they restyle across every theme.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/category-tiles
bun x bosia@latest add block storefront/value-row
bun x bosia@latest add block storefront/promo-banner
bun x bosia@latest add block storefront/promo-strip
bun x bosia@latest add block storefront/editorial
bun x bosia@latest add block storefront/testimonials
bun x bosia@latest add block storefront/newsletter
```

Each pulls [`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import CategoryTiles from "$lib/blocks/storefront/category-tiles/block.svelte";
	import Editorial from "$lib/blocks/storefront/editorial/block.svelte";
</script>

<CategoryTiles categories={[{ name: "Home", image: "/home.jpg" }]} />
<Editorial flip />
```

All sections take props for copy and content with sensible defaults. `editorial` accepts `flip` to
swap the image side; `value-row` and `testimonials` accept arrays of items; `newsletter` shows an
inline confirmation after submit.

## Source

`src/lib/blocks/storefront/{category-tiles,value-row,promo-banner,promo-strip,editorial,testimonials,newsletter}/block.svelte`
