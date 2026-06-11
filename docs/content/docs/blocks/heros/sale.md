---
title: Heros — Sale
description: Full-bleed sale hero with a countdown timer over a darkened photo.
demo: HeroSaleDemo
---

```bash
bun x bosia@latest add block heros/sale
```

Full-bleed sale hero with a countdown timer over a darkened photo. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/sale
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Sale from "$lib/blocks/heros/sale/block.svelte";
</script>

<Sale />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/sale/block.svelte`
