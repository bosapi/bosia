---
title: Pricing Sections
description: Full-width pricing sections — a three-tier column layout, a plan comparison table and a single-plan toggle.
demo: PricingSectionsDemo
---

Drop-in pricing sections for a landing or marketing page. Each is a self-contained, full-width
Svelte `<section>` built **only** from semantic tokens, so it restyles across every theme — the
brand colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block pricing/columns
bun x bosia@latest add block pricing/comparison
bun x bosia@latest add block pricing/simple
```

These pull [`@lucide/svelte`](/components/ui/icon/) for icons.

## The blocks

- **`columns`** — three tier cards with a lifted "Most popular" plan, feature checklists and CTAs.
- **`comparison`** — a plan-column table with price headers and check / minus / value rows.
- **`simple`** — one centred plan with a monthly / yearly toggle, two-column checklist and a wide CTA.

## Usage

```svelte
<script lang="ts">
	import Pricing from "$lib/blocks/pricing/columns/block.svelte";
</script>

<Pricing />
```

Content lives in hardcoded arrays at the top of each `block.svelte` — edit the tiers, prices and
features to match your product. The featured tier and every accent use `primary`, so the section
follows whichever theme is active.

## Source

`src/lib/blocks/pricing/*/block.svelte`
