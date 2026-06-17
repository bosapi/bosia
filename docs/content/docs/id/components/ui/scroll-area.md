---
title: Scroll Area
description: Kontainer yang bisa di-scroll dengan scrollbar bergaya kustom.
demo: ScrollAreaDemo
---

```bash
bun x bosia@latest add scroll-area
```

Memperkaya perilaku scroll native dengan scrollbar bergaya kustom.

## Preview

## Props

| Prop          | Type                                   | Default      |
| ------------- | -------------------------------------- | ------------ |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` |
| `class`       | `string`                               | `""`         |

## Penggunaan

```svelte
<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area";
</script>

<ScrollArea class="h-48">
	<!-- content -->
</ScrollArea>
```
