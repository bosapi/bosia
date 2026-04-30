---
title: Skeleton
description: A placeholder used to show a loading state.
demo: SkeletonDemo
---

```bash
bosia add skeleton
```

A minimal placeholder element used to stub out the shape of content while data is loading. Renders a single `<div>` with `animate-pulse rounded-md bg-accent` base classes — size and shape are controlled entirely through Tailwind utility classes.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

All additional attributes are forwarded to the root `<div>`.

## Usage

```svelte
<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<Skeleton class="h-4 w-[250px]" />
```

## Examples

Combine multiple skeletons to approximate a card-like loading state — a circular avatar alongside two text lines.

```svelte
<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<div class="flex items-center gap-4">
	<Skeleton class="size-12 rounded-full" />
	<div class="flex flex-col gap-2">
		<Skeleton class="h-4 w-[250px]" />
		<Skeleton class="h-4 w-[200px]" />
	</div>
</div>
```

Use a larger block shape to stub out a media area.

```svelte
<Skeleton class="h-[125px] w-[250px] rounded-xl" />
```
