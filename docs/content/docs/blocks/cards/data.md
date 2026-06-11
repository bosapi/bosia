---
title: Cards — Data & Dashboard
description: Stat, progress, chart, and balance cards for dashboards and analytics.
demo: CardsDataDemo
---

Dashboard cards for numbers and trends. Each is a self-contained, token-driven block — the
brand colour maps to `--primary`, so they restyle automatically when you switch themes. Try the
theme switcher above the preview.

## Preview

## Install

Each card installs on its own:

```bash
bun x bosia@latest add block cards/stat
bun x bosia@latest add block cards/progress
bun x bosia@latest add block cards/chart
bun x bosia@latest add block cards/balance
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons. The sparkline,
ring, and mini-bars are inline SVG/CSS using semantic-token strokes — no chart library.

## Usage

```svelte
<script lang="ts">
	import Stat from "$lib/blocks/cards/stat/block.svelte";
</script>

<Stat />
```

All copy and data are hard-coded sample content — edit `block.svelte` to wire in your own.
