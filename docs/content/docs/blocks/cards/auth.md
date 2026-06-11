---
title: Cards — Auth & Marketing
description: Login and feature cards for auth screens and marketing pages.
demo: CardsAuthDemo
---

Auth and marketing cards. The feature card replaces the old `cards/feature-editorial` block — it
uses `--primary` for the icon and link accent (the editorial block painted them with `accent`, a
subtle hover background, so it never followed the brand).

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
