---
title: Newsletter Sections
description: Newsletter sections — a centered signup and a split card, both posting to /api/newsletter.
demo: NewsletterSectionsDemo
---

Email signup sections for any site with an audience. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme. Try the theme
switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block newsletter/centered
bun x bosia@latest add block newsletter/split
```

## The blocks

- **`centered`** — kicker, heading and copy over an inline email + subscribe form.
- **`split`** — heading and copy beside the form, wrapped in a card with a no-spam note.

## Usage

```svelte
<script lang="ts">
	import Newsletter from "$lib/blocks/newsletter/centered/block.svelte";
</script>

<Newsletter />
```

Both blocks POST `{ email }` as JSON to `/api/newsletter` — install the
[`newsletter` feature](/guides/newsletter/) for the validated, duplicate-safe endpoint, or point
the `action` prop at your own route. Copy is overridable via `kicker`, `heading`, `copy` (and
`note` on `split`).

## Source

`src/lib/blocks/newsletter/*/block.svelte`
