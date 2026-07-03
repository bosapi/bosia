---
title: CTA Sections
description: Call-to-action sections — a full-width primary banner and a rounded dark email-capture panel.
demo: CtaSectionsDemo
---

Closing call-to-action sections for a landing or marketing page. Each is a self-contained,
full-width Svelte `<section>` built **only** from semantic tokens, so it restyles across every
theme — the brand colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block cta/banner
bun x bosia@latest add block cta/panel
```

`banner` pulls [`@lucide/svelte`](/components/ui/icon/) for its icon.

## The blocks

- **`banner`** — a full-width `primary` band with a headline and a button pair.
- **`panel`** — a rounded dark panel with a soft primary glow, an email input and a submit button.

## Usage

```svelte
<script lang="ts">
	import Cta from "$lib/blocks/cta/banner/block.svelte";
</script>

<Cta />
```

Edit the headline and copy in each `block.svelte`. The `panel` form is visual only — wire its
submit handler to your own newsletter or signup endpoint.

## Source

`src/lib/blocks/cta/*/block.svelte`
