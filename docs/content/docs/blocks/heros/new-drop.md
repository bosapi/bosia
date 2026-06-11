---
title: Heros — New Drop
description: Fashion new-drop product hero with a size selector and price.
demo: HeroNewDropDemo
---

```bash
bun x bosia@latest add block heros/new-drop
```

Fashion new-drop product hero with a size selector and price. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/new-drop
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import NewDrop from "$lib/blocks/heros/new-drop/block.svelte";
</script>

<NewDrop />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/new-drop/block.svelte`
