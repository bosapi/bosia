---
title: Heros — Restaurant
description: Full-bleed restaurant hero with a reservation CTA and venue meta.
demo: HeroRestaurantDemo
---

```bash
bun x bosia@latest add block heros/restaurant
```

Full-bleed restaurant hero with a reservation CTA and venue meta. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/restaurant
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Restaurant from "$lib/blocks/heros/restaurant/block.svelte";
</script>

<Restaurant />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/restaurant/block.svelte`
