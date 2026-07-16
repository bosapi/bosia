---
title: Pages — About
description: An about page composed from blocks — navbar, hero, stats band, team grid, CTA panel and footer.
demo: PagesCompanyAboutDemo
---

A complete about / company page: a minimal navbar, a consulting-style hero, a stats band, the
team grid, a closing CTA panel and a minimal footer. Every block is theme-aware — try the theme
switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add page company/about
```

Installs `page.svelte` plus every block it composes. Several of those blocks pull
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import About from "$lib/pages/company/about/page.svelte";
</script>

<About />
```

The page is composition only — it imports each block and stacks them in order, with no props.
Edit the individual blocks under `src/lib/blocks/` to change copy, or reorder / remove sections in
`page.svelte`. Add `team/spotlight` above the team grid for a founder feature, or swap the hero
for any other `heros/*` block.

## Source

`src/lib/pages/company/about/page.svelte`
