---
title: Pages — Simple Landing
description: A lean landing page composed from marketing blocks — minimal navbar, hero, split features, spotlight testimonial, CTA panel and footer.
demo: PagesLandingSimpleDemo
---

A lean, single-product landing page for when the full SaaS layout is more than you need: a minimal
navbar, an agency hero, alternating split features, a spotlight testimonial, a CTA panel and a
minimal footer. Every block is theme-aware — try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add page landing/simple
```

Installs `page.svelte` plus every block it composes. Some of those blocks pull
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Landing from "$lib/pages/landing/simple/page.svelte";
</script>

<Landing />
```

The page is composition only — it imports each block and stacks them in order, with no props. Edit
the individual blocks under `src/lib/blocks/` to change copy, or reorder / remove sections in
`page.svelte`. For the full marketing layout, see the [SaaS landing](/pages/landing/saas).

## Source

`src/lib/pages/landing/simple/page.svelte`
