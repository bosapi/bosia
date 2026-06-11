---
title: Heros — Agency
description: Bold dark agency hero with a glow accent and client logos.
demo: HeroAgencyDemo
---

```bash
bun x bosia@latest add block heros/agency
```

Bold dark agency hero with a glow accent and client logos. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/agency
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Agency from "$lib/blocks/heros/agency/block.svelte";
</script>

<Agency />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/agency/block.svelte`
