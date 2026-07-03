---
title: Stats Sections
description: Metric sections — a slim number band and a row of stat cards with delta chips.
demo: StatsSectionsDemo
---

Metric sections for a landing or marketing page. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme — the brand
colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block stats/band
bun x bosia@latest add block stats/cards
```

`cards` pulls [`@lucide/svelte`](/components/ui/icon/) for its icons.

## The blocks

- **`band`** — a slim muted band of four oversized numbers with hairline separators.
- **`cards`** — four stat cards, each with an icon, value, label and a primary delta chip.

## Usage

```svelte
<script lang="ts">
	import Stats from "$lib/blocks/stats/band/block.svelte";
</script>

<Stats />
```

The numbers and labels live in a hardcoded array at the top of each `block.svelte` — swap in your
own metrics.

## Source

`src/lib/blocks/stats/*/block.svelte`
