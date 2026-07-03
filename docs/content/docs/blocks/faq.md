---
title: FAQ Sections
description: Frequently-asked-questions sections — a native details accordion and a static two-column grid.
demo: FaqSectionsDemo
---

FAQ sections for a landing or marketing page. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme — the brand
colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block faq/accordion
bun x bosia@latest add block faq/grid
```

`accordion` pulls [`@lucide/svelte`](/components/ui/icon/) for its toggle icon.

## The blocks

- **`accordion`** — a sticky heading and support card beside an expandable list. Built on the native
  `<details>` / `<summary>` element, so it needs no JavaScript and no extra components.
- **`grid`** — a static two-column question-and-answer grid with hairline dividers.

## Usage

```svelte
<script lang="ts">
	import Faq from "$lib/blocks/faq/accordion/block.svelte";
</script>

<Faq />
```

Questions and answers live in a hardcoded array at the top of each `block.svelte`. The accordion
uses native disclosure, so open / close state works without any client code.

## Source

`src/lib/blocks/faq/*/block.svelte`
