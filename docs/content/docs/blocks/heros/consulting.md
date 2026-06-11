---
title: Heros — Consulting
description: B2B consulting split hero with bullet points and result stats.
demo: HeroConsultingDemo
---

```bash
bun x bosia@latest add block heros/consulting
```

B2B consulting split hero with bullet points and result stats. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/consulting
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Consulting from "$lib/blocks/heros/consulting/block.svelte";
</script>

<Consulting />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/consulting/block.svelte`
