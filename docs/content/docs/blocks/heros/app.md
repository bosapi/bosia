---
title: Heros — App
description: SaaS app hero with a feature list and a phone mockup.
demo: HeroAppDemo
---

```bash
bun x bosia@latest add block heros/app
```

SaaS app hero with a feature list and a phone mockup. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/app
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import App from "$lib/blocks/heros/app/block.svelte";
</script>

<App />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/app/block.svelte`
