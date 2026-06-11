---
title: Heros — Apparel
description: Apparel hero with color swatches and a size picker beside a model.
demo: HeroApparelDemo
---

```bash
bun x bosia@latest add block heros/apparel
```

Apparel hero with color swatches and a size picker beside a model. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/apparel
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Apparel from "$lib/blocks/heros/apparel/block.svelte";
</script>

<Apparel />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/apparel/block.svelte`
