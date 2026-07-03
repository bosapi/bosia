---
title: Features Sections
description: Feature sections — an icon-tile grid, alternating split rows and a mixed bento grid.
demo: FeaturesSectionsDemo
---

Feature sections for a landing or marketing page. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme — the brand
colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block features/grid
bun x bosia@latest add block features/split
bun x bosia@latest add block features/bento
```

These pull [`@lucide/svelte`](/components/ui/icon/) for icons.

## The blocks

- **`grid`** — a heading over a three-by-two grid of icon feature tiles.
- **`split`** — alternating copy-and-visual rows with a kicker, checklist and a mock panel.
- **`bento`** — one large tile plus four small tiles mixing icons, a stat and a mini-visual.

## Usage

```svelte
<script lang="ts">
	import Features from "$lib/blocks/features/grid/block.svelte";
</script>

<Features />
```

Feature copy and icons live in hardcoded arrays at the top of each `block.svelte`. Import lucide
icons by their exact name and swap them in — every icon accent uses `primary`.

## Source

`src/lib/blocks/features/*/block.svelte`
