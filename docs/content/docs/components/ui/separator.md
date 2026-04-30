---
title: Separator
description: A horizontal or vertical divider line.
demo: SeparatorDemo
---

```bash
bosia add separator
```

A horizontal or vertical divider line.

## Preview

## Props

| Prop          | Type                           | Default        |
| ------------- | ------------------------------ | -------------- |
| `orientation` | `"horizontal"` \| `"vertical"` | `"horizontal"` |

## Usage

```svelte
<script lang="ts">
	import { Separator } from "$lib/components/ui/separator";
</script>

<p>Above</p>
<Separator />
<p>Below</p>
```

## Vertical

```svelte
<div class="flex h-8 items-center gap-4">
	<span>Left</span>
	<Separator orientation="vertical" />
	<span>Right</span>
</div>
```
