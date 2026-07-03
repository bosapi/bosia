---
title: Logos Sections
description: Logo-cloud sections — a trusted-by row and a bordered cell grid of styled-text wordmarks.
demo: LogosSectionsDemo
---

Logo-cloud sections for a landing or marketing page. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme. Try the theme
switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block logos/row
bun x bosia@latest add block logos/grid
```

## The blocks

- **`row`** — a trusted-by microcopy line over six grayscale styled-text wordmarks.
- **`grid`** — a bordered two-by-four cell grid of wordmarks that darken on hover.

## Usage

```svelte
<script lang="ts">
	import Logos from "$lib/blocks/logos/row/block.svelte";
</script>

<Logos />
```

The wordmarks ship as fictional styled text (no real trademarks) in a hardcoded array — replace
them with your customers' names, or swap the `<span>` for an `<img>` if you have logo assets.

## Source

`src/lib/blocks/logos/*/block.svelte`
