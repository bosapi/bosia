---
title: Separator
description: Garis pembatas horizontal atau vertikal.
demo: SeparatorDemo
---

```bash
bun x bosia@latest add separator
```

Garis pembatas horizontal atau vertikal.

## Preview

## Props

| Prop          | Type                           | Default        |
| ------------- | ------------------------------ | -------------- |
| `orientation` | `"horizontal"` \| `"vertical"` | `"horizontal"` |

## Penggunaan

```svelte
<script lang="ts">
	import { Separator } from "$lib/components/ui/separator";
</script>

<p>Above</p>
<Separator />
<p>Below</p>
```

## Vertikal

```svelte
<div class="flex h-8 items-center gap-4">
	<span>Left</span>
	<Separator orientation="vertical" />
	<span>Right</span>
</div>
```
