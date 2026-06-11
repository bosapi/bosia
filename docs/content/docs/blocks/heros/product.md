---
title: Heros — Product
description: Centered SaaS product-launch hero with email capture and a browser mock.
demo: HeroProductDemo
---

```bash
bun x bosia@latest add block heros/product
```

Centered SaaS product-launch hero with email capture and a browser mock. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/product
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Product from "$lib/blocks/heros/product/block.svelte";
</script>

<Product />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/product/block.svelte`
