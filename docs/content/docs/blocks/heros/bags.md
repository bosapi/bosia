---
title: Heros — Bags
description: Dark premium product hero with spec callouts and an edition badge.
demo: HeroBagsDemo
---

```bash
bun x bosia@latest add block heros/bags
```

Dark premium product hero with spec callouts and an edition badge. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/bags
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Bags from "$lib/blocks/heros/bags/block.svelte";
</script>

<Bags />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/bags/block.svelte`
