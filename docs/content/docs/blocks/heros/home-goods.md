---
title: Heros — Home Goods
description: Full-bleed lifestyle hero with a floating featured-product card.
demo: HeroHomeGoodsDemo
---

```bash
bun x bosia@latest add block heros/home-goods
```

Full-bleed lifestyle hero with a floating featured-product card. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/home-goods
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import HomeGoods from "$lib/blocks/heros/home-goods/block.svelte";
</script>

<HomeGoods />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/home-goods/block.svelte`
