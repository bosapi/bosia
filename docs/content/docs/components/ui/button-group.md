---
title: Button Group
description: A container that visually groups multiple buttons into a single connected unit.
demo: ButtonGroupDemo
---

```bash
bosia add button-group
```

Button Group merges adjacent buttons into a single visual unit by collapsing their borders and rounding only the outer corners. Use it for toolbars, segmented controls, or any set of related actions.

## Preview

## Props

| Prop          | Type                         | Default        |
| ------------- | ---------------------------- | -------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `class`       | `string`                     | `""`           |

## Usage

```svelte
<script lang="ts">
	import { ButtonGroup } from "$lib/components/ui/button-group";
	import { Button } from "$lib/components/ui/button";
</script>

<ButtonGroup aria-label="Actions">
	<Button variant="outline">Save</Button>
	<Button variant="outline">Edit</Button>
	<Button variant="outline">Delete</Button>
</ButtonGroup>
```

## Vertical

Stack buttons vertically using `orientation="vertical"`.

```svelte
<ButtonGroup orientation="vertical" aria-label="Navigation">
	<Button variant="outline">Profile</Button>
	<Button variant="outline">Settings</Button>
	<Button variant="outline">Logout</Button>
</ButtonGroup>
```

## Icon Buttons

Works with icon-sized buttons for compact toolbars.

```svelte
<ButtonGroup aria-label="Text alignment">
	<Button variant="outline" size="icon" aria-label="Align left">
		<AlignLeftIcon class="size-4" />
	</Button>
	<Button variant="outline" size="icon" aria-label="Align center">
		<AlignCenterIcon class="size-4" />
	</Button>
	<Button variant="outline" size="icon" aria-label="Align right">
		<AlignRightIcon class="size-4" />
	</Button>
</ButtonGroup>
```

## Accessibility

Always provide an `aria-label` on the `ButtonGroup` to describe the purpose of the group to screen readers. The component renders with `role="group"` automatically.
