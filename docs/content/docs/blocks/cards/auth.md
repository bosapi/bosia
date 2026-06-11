---
title: Cards — Auth & Marketing
description: Login and feature cards for auth screens and marketing pages.
demo: CardsAuthDemo
---

Auth and marketing cards. The feature card uses `--primary` for its icon and link accent, so it
follows the active theme's brand colour.

## Preview

## Install

Each card installs on its own:

```bash
bun x bosia@latest add block cards/login
bun x bosia@latest add block cards/feature
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Feature from "$lib/blocks/cards/feature/block.svelte";
</script>

<Feature />
```

The login card's inputs are static sample markup — wire them to your own form state and submit
handler.
