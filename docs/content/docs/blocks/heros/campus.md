---
title: Heros — Campus
description: Centered full-bleed campus hero with admissions stats.
demo: HeroCampusDemo
---

```bash
bun x bosia@latest add block heros/campus
```

Centered full-bleed campus hero with admissions stats. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/campus
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Campus from "$lib/blocks/heros/campus/block.svelte";
</script>

<Campus />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/campus/block.svelte`
