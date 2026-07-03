---
title: Pages — SaaS Landing
description: A full SaaS landing page composed from marketing blocks — navbar, hero, logos, features, stats, pricing, testimonials, FAQ, CTA and footer.
demo: PagesLandingSaasDemo
---

A complete SaaS landing page, composed end to end from registry blocks: a classic navbar, an app
hero, a logo cloud, a feature grid, a stats band, a three-tier pricing table, a testimonial grid,
an FAQ accordion, a closing CTA and a four-column footer. Every block is theme-aware — try the
theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add page landing/saas
```

Installs `page.svelte` plus every block it composes. Several of those blocks pull
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Landing from "$lib/pages/landing/saas/page.svelte";
</script>

<Landing />
```

The page is composition only — it imports each block and stacks them in order, with no props. Edit
the individual blocks under `src/lib/blocks/` to change copy, or reorder / remove sections in
`page.svelte`. Swap the `navbars/classic` import for any other navbar, or `footers/columns` for any
other footer, to restyle the frame.

## Source

`src/lib/pages/landing/saas/page.svelte`
