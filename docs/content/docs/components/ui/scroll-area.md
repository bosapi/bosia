---
title: Scroll Area
description: A scrollable container with a custom styled scrollbar.
demo: ScrollAreaDemo
---

```bash
bosia add scroll-area
```

Augments native scroll behavior with a custom-styled scrollbar.

## Preview

## Props

| Prop | Type | Default |
| ---- | ---- | ------- |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` |
| `class` | `string` | `""` |

## Usage

```svelte
<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
</script>

<ScrollArea class="h-48">
  <!-- content -->
</ScrollArea>
```
