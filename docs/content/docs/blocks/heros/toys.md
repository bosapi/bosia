---
title: Heros — Toys
description: Playful kids-toys hero with an age filter and a category tile grid.
demo: HeroToysDemo
---

```bash
bun x bosia@latest add block heros/toys
```

Playful kids-toys hero with an age filter and a category tile grid. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/toys
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Toys from "$lib/blocks/heros/toys/block.svelte";
</script>

<Toys />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/toys/block.svelte`
