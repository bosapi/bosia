---
title: Navbars — Themes
description: Styled navbar variants — dark, glass, brutalist, floating pill, gradient, brand bar and transparent overlay.
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
bun x bosia@latest add block navbars/overlay
```

Some pull the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The blocks

- **`dark`** — solid bar on the foreground colour with inverted text and links.
- **`glass`** — a translucent blurred bar with a search field and primary CTA.
- **`brutalist`** — a primary brand bar with thick borders, mono caps and a hard shadow.
- **`pill`** — a centered rounded capsule that floats over the content.
- **`gradient`** — a dark gradient bar with a soft primary glow and a beta pill.
- **`lime`** — a bold full-colour primary brand bar with a contrasting solid CTA.
- **`overlay`** — transparent bar with light text and an outline CTA, made to float over a hero image.

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

`overlay` is the exception to the layout-level rule: it's `position: absolute`, so instead of
sitting above your content it **floats over the first section**. Render it as the first child of a
`relative` hero `<section>` (the photo heroes in [Blocks → Heros](/docs/blocks/heros/restaurant/)
are built for exactly this), not in `+layout.svelte`. Its light text is tuned for a dark photo or
scrim:

```svelte
<section class="relative …">
	<img class="absolute inset-0 …" … />
	<div class="absolute inset-0 bg-foreground/50"></div>
	<Overlay />
	<!-- hero content -->
</section>
```

## Source

`src/lib/blocks/navbars/*/block.svelte`
