---
title: Cards — Media
description: Article, music, video, and gallery cards for media-rich UIs.
demo: CardsMediaDemo
---

Media cards for articles, audio, video, and photo galleries. Image areas are theme-aware
placeholder gradients (`from-primary/10 to-muted`) with a Lucide glyph — swap in a real `<img>`
when you wire up content.

## Preview

## Install

Each card installs on its own:

```bash
bun x bosia@latest add block cards/article
bun x bosia@latest add block cards/music
bun x bosia@latest add block cards/video
bun x bosia@latest add block cards/gallery
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Music from "$lib/blocks/cards/music/block.svelte";
</script>

<Music />
```

The music card's play/pause is cosmetic local `$state` — connect it to your own audio element.
