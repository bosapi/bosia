---
title: Navbars — Themes
description: Styled navbar variants — dark, glass, brutalist, floating pill, gradient and brand bar.
demo: NavbarsThemesDemo
---

Navbars with a stronger visual treatment. Each is a self-contained, full-width Svelte `<header>`
built **only** from semantic tokens, so it restyles across every theme — the brand colour maps to
`--primary`. Try the theme switcher above the preview.

## Preview

## Install

Each navbar installs on its own:

```bash
bun x bosia@latest add block navbars/dark
bun x bosia@latest add block navbars/glass
bun x bosia@latest add block navbars/brutalist
bun x bosia@latest add block navbars/pill
bun x bosia@latest add block navbars/gradient
bun x bosia@latest add block navbars/lime
```

Some pull the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The blocks

- **`dark`** — solid bar on the foreground colour with inverted text and links.
- **`glass`** — a translucent blurred bar with a search field and primary CTA.
- **`brutalist`** — a primary brand bar with thick borders, mono caps and a hard shadow.
- **`pill`** — a centered rounded capsule that floats over the content.
- **`gradient`** — a dark gradient bar with a soft primary glow and a beta pill.
- **`lime`** — a bold full-colour primary brand bar with a contrasting solid CTA.

## Usage

```svelte
<script lang="ts">
	import Glass from "$lib/blocks/navbars/glass/block.svelte";
</script>

<Glass />
```

The brand action is always `primary` — the original lime accent collapses to your theme's brand
colour, so the bar follows whichever theme is active. Edit `block.svelte` to swap the wordmark and
copy.

## Source

`src/lib/blocks/navbars/*/block.svelte`
