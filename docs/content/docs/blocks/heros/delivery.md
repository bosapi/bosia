---
title: Heros — Delivery
description: Food-delivery hero with an address search bar and floating dishes.
demo: HeroDeliveryDemo
---

```bash
bun x bosia@latest add block heros/delivery
```

Food-delivery hero with an address search bar and floating dishes. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/delivery
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Delivery from "$lib/blocks/heros/delivery/block.svelte";
</script>

<Delivery />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/delivery/block.svelte`
