---
title: Process Sections
description: Process sections — a numbered how-it-works row and a vertical milestone timeline.
demo: ProcessSectionsDemo
---

"How it works" sections for a service, agency or product site. Each is a self-contained,
full-width Svelte `<section>` built **only** from semantic tokens, so it restyles across every
theme. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block process/steps
bun x bosia@latest add block process/timeline
```

## The blocks

- **`steps`** — a centered heading over a numbered horizontal row of steps, connector lines on
  desktop.
- **`timeline`** — a vertical milestone timeline with year labels — good for an "our story"
  section on an about page.

## Usage

```svelte
<script lang="ts">
	import Steps from "$lib/blocks/process/steps/block.svelte";
</script>

<Steps />
```

Both blocks ship with sample copy so they render standalone. To use your own, pass `heading`,
`intro` and the list: `steps` takes `steps` (array of `{ title, description }`), `timeline` takes
`entries` (array of `{ label, title, description }`).

## Source

`src/lib/blocks/process/*/block.svelte`
