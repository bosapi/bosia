---
title: Aspect Ratio
description: Menampilkan konten dalam rasio yang diinginkan.
demo: AspectRatioDemo
---

```bash
bun x bosia@latest add aspect-ratio
```

Menampilkan konten dalam rasio yang diinginkan memakai teknik padding-bottom CSS.

## Preview

## Props

| Prop    | Type     | Default  |
| ------- | -------- | -------- |
| `ratio` | `number` | `16 / 9` |

## Penggunaan

```svelte
<script lang="ts">
	import { AspectRatio } from "$lib/components/ui/aspect-ratio";
</script>

<AspectRatio ratio={16 / 9} class="overflow-hidden rounded-lg bg-muted">
	<img src="/my-image.jpg" alt="Landscape" class="h-full w-full object-cover" />
</AspectRatio>
```

## Persegi

```svelte
<AspectRatio ratio={1} class="overflow-hidden rounded-lg bg-muted">
	<div class="flex h-full w-full items-center justify-center">Square content</div>
</AspectRatio>
```
