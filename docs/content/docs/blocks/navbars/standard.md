---
title: Navbars — Standard
description: Classic light navbar layouts — centered, split, search-led, minimal and two-tier.
demo: NavbarsStandardDemo
---

Everyday top navigation bars. Each is a self-contained, full-width Svelte `<header>` built **only**
from semantic tokens, so it restyles across every theme — the brand colour maps to `--primary`.
Try the theme switcher above the preview.

## Preview

## Install

Each navbar installs on its own:

```bash
bun x bosia@latest add block navbars/classic
bun x bosia@latest add block navbars/split
bun x bosia@latest add block navbars/centered
bun x bosia@latest add block navbars/search
bun x bosia@latest add block navbars/minimal
bun x bosia@latest add block navbars/two-tier
```

Some pull the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The blocks

- **`classic`** — logo left, centered links, login plus a primary CTA on the right.
- **`split`** — logo left, links and a single solid CTA grouped on the right.
- **`centered`** — centered logo with symmetric link groups flanking the wordmark.
- **`search`** — logo, links, a search field, notifications bell and avatar.
- **`minimal`** — generous whitespace, one primary action and a menu toggle.
- **`two-tier`** — a mono utility strip above the main wordmark row.

## Usage

```svelte
<script lang="ts">
	import Classic from "$lib/blocks/navbars/classic/block.svelte";
</script>

<Classic />
```

Navbars are full-width headers — drop one at the top of a route. Links point at `/`; wire them to
your own routes and handlers. Edit `block.svelte` to swap the wordmark and copy.

## Source

`src/lib/blocks/navbars/*/block.svelte`
