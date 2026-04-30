---
title: Popover
description: A floating content panel with configurable trigger, side, and alignment.
demo: PopoverDemo
---

```bash
bosia add popover
```

A floating panel anchored to a trigger. Supports click (default) and hover modes. Dismisses on click-outside (click mode) and Escape.

## Preview

## Props

### Popover

| Prop         | Type                   | Default   |
| ------------ | ---------------------- | --------- |
| `open`       | `boolean`              | `false`   |
| `trigger`    | `"click"` \| `"hover"` | `"click"` |
| `closeDelay` | `number`               | `150`     |
| `class`      | `string`               | `""`      |

### PopoverContent

| Prop         | Type                                           | Default    |
| ------------ | ---------------------------------------------- | ---------- |
| `side`       | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | `"bottom"` |
| `align`      | `"start"` \| `"center"` \| `"end"`             | `"center"` |
| `sideOffset` | `number`                                       | `4`        |
| `class`      | `string`                                       | `""`       |

## Sub-components

- `Popover` — root wrapper, manages open state
- `PopoverTrigger` — button that toggles the popover
- `PopoverContent` — the floating panel

## Usage

```svelte
<script lang="ts">
	import { Popover, PopoverTrigger, PopoverContent } from "$lib/components/ui/popover";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
</script>

<Popover>
	<PopoverTrigger>
		<Button variant="outline">Open popover</Button>
	</PopoverTrigger>
	<PopoverContent>
		<div class="grid gap-4">
			<div class="space-y-1">
				<h4 class="font-medium leading-none">Dimensions</h4>
				<p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
			</div>
			<div class="grid gap-2">
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="width">Width</Label>
					<Input id="width" value="100%" class="col-span-2 h-8" />
				</div>
			</div>
		</div>
	</PopoverContent>
</Popover>
```

## Positioning

Use `side` and `align` to place the content relative to the trigger.

```svelte
<!-- Above, aligned to the start -->
<PopoverContent side="top" align="start">...</PopoverContent>

<!-- To the right, centered -->
<PopoverContent side="right">...</PopoverContent>

<!-- Below, aligned to the end with extra offset -->
<PopoverContent side="bottom" align="end" sideOffset={8}>...</PopoverContent>
```

## Hover Trigger

Set `trigger="hover"` to open the popover on mouse enter. The popover stays open while the cursor is over the trigger or content. On touch devices, hover mode degrades to tap-to-toggle. Adjust `closeDelay` (ms) to control the delay before closing.

```svelte
<Popover trigger="hover" closeDelay={200}>
	<PopoverTrigger>
		<Button variant="outline">Hover me</Button>
	</PopoverTrigger>
	<PopoverContent>Tooltip-style content</PopoverContent>
</Popover>
```

## Controlled Open State

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Popover bind:open>
	<PopoverTrigger>
		<Button variant="outline">Toggle</Button>
	</PopoverTrigger>
	<PopoverContent>Content</PopoverContent>
</Popover>

<p>Popover is {open ? "open" : "closed"}</p>
```
