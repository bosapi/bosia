---
title: Gallery Sections
description: Gallery sections — a uniform grid with a dialog lightbox and a CSS-columns masonry.
demo: GallerySectionsDemo
---

Image gallery sections for a portfolio, agency or venue site. Each is a self-contained, full-width
Svelte `<section>` built **only** from semantic tokens, so it restyles across every theme. Try the
theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block gallery/grid
bun x bosia@latest add block gallery/masonry
```

`grid` pulls [`ui/dialog`](/components/ui/dialog/) for its lightbox.

## The blocks

- **`grid`** — uniform square thumbnails; clicking one opens the full photo in a dialog lightbox.
- **`masonry`** — mixed-height photos flowed into CSS columns — no JavaScript, no library.

## Usage

```svelte
<script lang="ts">
	import Gallery from "$lib/blocks/gallery/grid/block.svelte";
</script>

<Gallery />
```

Both blocks ship with sample photos so they render standalone. To use your own, pass `images` —
an array of `{ src, alt }` (`grid` also accepts an optional `caption` shown in the lightbox) —
plus `heading` and `intro` for the copy. Pair with the
[`file-upload` feature](/guides/file-upload/) if the images come from your own storage.

## Source

`src/lib/blocks/gallery/*/block.svelte`
