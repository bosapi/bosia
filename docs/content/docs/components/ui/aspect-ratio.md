---
title: Aspect Ratio
description: Displays content within a desired ratio.
demo: AspectRatioDemo
---

```bash
bosia add aspect-ratio
```

Displays content within a desired ratio using the CSS padding-bottom technique.

## Preview

## Props

| Prop    | Type     | Default  |
| ------- | -------- | -------- |
| `ratio` | `number` | `16 / 9` |

## Usage

```svelte
<script lang="ts">
	import { AspectRatio } from "$lib/components/ui/aspect-ratio";
</script>

<AspectRatio ratio={16 / 9} class="overflow-hidden rounded-lg bg-muted">
	<img src="/my-image.jpg" alt="Landscape" class="h-full w-full object-cover" />
</AspectRatio>
```

## Square

```svelte
<AspectRatio ratio={1} class="overflow-hidden rounded-lg bg-muted">
	<div class="flex h-full w-full items-center justify-center">Square content</div>
</AspectRatio>
```
