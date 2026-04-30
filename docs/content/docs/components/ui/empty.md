---
title: Empty
description: An empty state component with icon, title, description, and action slots.
demo: EmptyDemo
---

```bash
bosia add empty
```

A compound component for empty states. Composable sub-components: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and `EmptyContent`.

## Preview

## Props

### Empty

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### EmptyMedia

| Prop      | Type                    | Default     |
| --------- | ----------------------- | ----------- |
| `variant` | `"default"` \| `"icon"` | `"default"` |
| `class`   | `string`                | `""`        |

All other sub-components (`EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`) accept `class` and are optional.

## Usage

```svelte
<script lang="ts">
	import {
		Empty,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		EmptyDescription,
		EmptyContent,
	} from "$lib/components/ui/empty";
	import { Button } from "$lib/components/ui/button";
</script>

<Empty>
	<EmptyHeader>
		<EmptyMedia variant="icon">
			<svg><!-- your icon --></svg>
		</EmptyMedia>
		<EmptyTitle>No items yet</EmptyTitle>
		<EmptyDescription>Get started by creating your first item.</EmptyDescription>
	</EmptyHeader>
	<EmptyContent>
		<Button>Create item</Button>
	</EmptyContent>
</Empty>
```

## Minimal

All sub-components are optional:

```svelte
<Empty>
	<EmptyHeader>
		<EmptyTitle>Nothing here</EmptyTitle>
	</EmptyHeader>
</Empty>
```

## With Links

The description supports styled links:

```svelte
<EmptyDescription>
	No results found. Try <a href="/search">searching</a> for something else.
</EmptyDescription>
```
