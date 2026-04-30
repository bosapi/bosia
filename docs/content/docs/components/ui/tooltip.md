---
title: Tooltip
description: A popup that displays information related to an element on hover or focus.
demo: TooltipDemo
---

```bash
bosia add tooltip
```

A context-managed tooltip with trigger and content. Shows on hover or focus after a configurable delay, hides on leave, blur, or Escape.

## Preview

## Props

### Tooltip

| Prop            | Type      | Default |
| --------------- | --------- | ------- |
| `open`          | `boolean` | `false` |
| `delayDuration` | `number`  | `700`   |
| `class`         | `string`  | `""`    |

`open` is bindable with `bind:open`.

### TooltipContent

| Prop         | Type                                           | Default    |
| ------------ | ---------------------------------------------- | ---------- |
| `side`       | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | `"top"`    |
| `align`      | `"start"` \| `"center"` \| `"end"`             | `"center"` |
| `sideOffset` | `number`                                       | `4`        |
| `class`      | `string`                                       | `""`       |

## Sub-components

- `Tooltip` — root wrapper, manages open state and delay timer
- `TooltipTrigger` — button that shows/hides the tooltip on hover and focus
- `TooltipContent` — the popup panel with side positioning

## Usage

```svelte
<script lang="ts">
	import { Tooltip, TooltipTrigger, TooltipContent } from "$lib/components/ui/tooltip";
	import { Button } from "$lib/components/ui/button";
</script>

<Tooltip>
	<TooltipTrigger>
		<Button variant="outline">Hover me</Button>
	</TooltipTrigger>
	<TooltipContent>Add to library</TooltipContent>
</Tooltip>
```

## Sides

```svelte
<TooltipContent side="top">Top</TooltipContent>
<TooltipContent side="right">Right</TooltipContent>
<TooltipContent side="bottom">Bottom</TooltipContent>
<TooltipContent side="left">Left</TooltipContent>
```

## Delay Duration

```svelte
<!-- Show instantly -->
<Tooltip delayDuration={0}>
	<TooltipTrigger>...</TooltipTrigger>
	<TooltipContent>No delay</TooltipContent>
</Tooltip>

<!-- Longer delay -->
<Tooltip delayDuration={1500}>
	<TooltipTrigger>...</TooltipTrigger>
	<TooltipContent>Shows after 1.5s</TooltipContent>
</Tooltip>
```

## Controlled Open State

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Tooltip bind:open>
	<TooltipTrigger>...</TooltipTrigger>
	<TooltipContent>Controlled</TooltipContent>
</Tooltip>

<p>Tooltip is {open ? "visible" : "hidden"}</p>
```

## Accessibility

- `TooltipContent` renders with `role="tooltip"` and a unique `id`
- `TooltipTrigger` sets `aria-describedby` pointing to the content when open
- Escape key dismisses an open tooltip
- Tooltip responds to both `mouseenter`/`mouseleave` and `focus`/`blur`, so keyboard users see it too
