---
title: Cards — Media
description: Article, music, video, and gallery cards for media-rich UIs.
demo: CardsMediaDemo
---

Media cards for articles, audio, video, and photo galleries. Images are small Unsplash photos,
lazy-loaded and sized down to keep bandwidth low — swap each `src` for your own content.

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
