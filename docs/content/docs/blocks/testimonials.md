---
title: Testimonials Sections
description: Social-proof sections — a grid of quote cards and a single oversized spotlight quote.
demo: TestimonialsSectionsDemo
---

Social-proof sections for a landing or marketing page. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme — the brand
colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block testimonials/grid
bun x bosia@latest add block testimonials/spotlight
```

These pull [`@lucide/svelte`](/components/ui/icon/) for icons.

## The blocks

- **`grid`** — a heading over quote cards with star ratings, initials avatars and name / role.
- **`spotlight`** — a single oversized pull-quote with an avatar, name / company and dot indicators.

## Usage

```svelte
<script lang="ts">
	import Testimonials from "$lib/blocks/testimonials/grid/block.svelte";
</script>

<Testimonials />
```

Quotes and names live in hardcoded arrays at the top of each `block.svelte` — swap in your own.
Stars and accents use `primary` and status colours, so each section follows the active theme.

## Source

`src/lib/blocks/testimonials/*/block.svelte`
