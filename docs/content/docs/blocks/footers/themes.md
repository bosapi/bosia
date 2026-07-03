---
title: Footers — Themes
description: Styled footer variants — dark, glass, gradient CTA, brutalist, editorial and terminal.
demo: FootersThemesDemo
---

Footers with a stronger visual treatment. Each is a self-contained, full-width Svelte `<footer>`
built **only** from semantic tokens, so it restyles across every theme — the brand colour maps to
`--primary`. Try the theme switcher above the preview.

## Preview

## Install

Each footer installs on its own:

```bash
bun x bosia@latest add block footers/dark
bun x bosia@latest add block footers/glass
bun x bosia@latest add block footers/gradient
bun x bosia@latest add block footers/brutalist
bun x bosia@latest add block footers/editorial
bun x bosia@latest add block footers/terminal
```

## The blocks

- **`dark`** — solid multi-column footer on the foreground colour with inverted text and socials.
- **`glass`** — a translucent blurred panel floating on a muted band with a soft primary glow.
- **`gradient`** — a dark gradient band with a primary glow behind a large centred CTA headline.
- **`brutalist`** — a primary brand band with thick borders, boxed mono link cells and a copyright stamp.
- **`editorial`** — an oversized serif wordmark, hairline rules and small-caps link rows.
- **`terminal`** — mono text on the foreground with prompt-prefixed links and a blinking cursor.

## Usage

```svelte
<script lang="ts">
	import Dark from "$lib/blocks/footers/dark/block.svelte";
</script>

<Dark />
```

The wordmark ships as the literal `__BRAND__` placeholder — `bun run check` fails until you swap it
for your own brand. The brand accent is always `primary`, so each footer follows whichever theme is
active. Edit `block.svelte` to swap the wordmark and copy.

## Source

`src/lib/blocks/footers/*/block.svelte`
