---
title: Direction
description: A provider component that sets text direction (LTR/RTL) via context.
demo: DirectionDemo
---

```bash
bosia add direction
```

A context provider that sets `dir` on a wrapper element and exposes the current direction to descendant components via `useDirection()`. Useful for apps supporting right-to-left languages like Arabic, Hebrew, and Persian.

## Preview

## Props

| Prop        | Type               | Default |
| ----------- | ------------------ | ------- |
| `direction` | `"ltr"` \| `"rtl"` | `"ltr"` |

## Usage

### Provider

Wrap your content with `DirectionProvider`:

```svelte
<script lang="ts">
	import { DirectionProvider } from "$lib/components/ui/direction";
</script>

<DirectionProvider direction="rtl">
	<p>This content flows right-to-left.</p>
</DirectionProvider>
```

### Reading direction in child components

Use `useDirection()` to read the current direction from context:

```svelte
<script lang="ts">
	import { useDirection } from "$lib/components/ui/direction";

	const dir = useDirection(); // "ltr" | "rtl"
</script>

<p>Current direction: {dir}</p>
```
