---
title: Footers — Standard
description: Classic light footer layouts — minimal, columns, newsletter, centered, mega and split-brand.
demo: FootersStandardDemo
---

Everyday site footers. Each is a self-contained, full-width Svelte `<footer>` built **only** from
semantic tokens, so it restyles across every theme — the brand colour maps to `--primary`. Try the
theme switcher above the preview.

## Preview

## Install

Each footer installs on its own:

```bash
bun x bosia@latest add block footers/minimal
bun x bosia@latest add block footers/columns
bun x bosia@latest add block footers/newsletter
bun x bosia@latest add block footers/centered
bun x bosia@latest add block footers/mega
bun x bosia@latest add block footers/split-brand
```

Some pull the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The blocks

- **`minimal`** — single row: wordmark left, inline links centre, copyright right; stacks on mobile.
- **`columns`** — four columns: a brand column with blurb and socials plus three link columns.
- **`newsletter`** — an email-capture band above the link columns and a legal row.
- **`centered`** — centre-stacked glyph, tagline, link row and circular social buttons.
- **`mega`** — five link columns, a contact column and language / currency selects.
- **`split-brand`** — oversized wordmark and a CTA pair left, compact links right, legal strip.

## Usage

```svelte
<script lang="ts">
	import Columns from "$lib/blocks/footers/columns/block.svelte";
</script>

<Columns />
```

The wordmark ships as the literal `__BRAND__` placeholder — `bun run check` fails until you swap it
for your own brand, so a fresh scaffold never ships someone else's name. Social links use inline SVG
glyphs (Lucide v1 no longer bundles brand icons); edit `block.svelte` to point them at your profiles.

## Source

`src/lib/blocks/footers/*/block.svelte`
