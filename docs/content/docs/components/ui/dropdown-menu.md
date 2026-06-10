---
title: Dropdown Menu
description: A context-managed dropdown menu with trigger, content, items, and separator.
demo: DropdownMenuDemo
---

```bash
bun x bosia@latest add dropdown-menu
```

A context-managed dropdown with trigger, content, items, and separator. Handles click-outside and Escape to close.

## Preview

## Props

### DropdownMenu

| Prop    | Type      | Default | Description                                                                                                                                                   |
| ------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`  | `boolean` | `false` | Bindable. Reflects whether the menu is open — useful for animating the trigger (e.g. rotating a chevron) or controlling the menu programmatically.            |
| `class` | `string`  | `""`    | Applied to the wrapper. The default is `relative inline-block`; pass `block w-full` when the trigger needs to span its parent (e.g. inside a sidebar footer). |

### DropdownMenuContent

| Prop       | Type                               | Default     | Description                                                                                                                                                                          |
| ---------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `align`    | `"start"` \| `"end"` \| `"center"` | `"end"`     | Horizontal alignment relative to the anchor.                                                                                                                                         |
| `side`     | `"top"` \| `"bottom"`              | `"bottom"`  | Open above (`"top"`) or below (`"bottom"`) the anchor. Only meaningful with `floating`.                                                                                              |
| `floating` | `boolean`                          | `false`     | Switch the menu to `position: fixed` so it escapes ancestors with `overflow-hidden` (e.g. inside a `Sidebar`). Coordinates are computed from the anchor's bounding rect.             |
| `anchor`   | `HTMLElement \| undefined`         | `undefined` | When set (and `floating` is `true`), the menu opens from this element's rect instead of the trigger's. Useful when only a sub-element of the trigger (like a chevron) is the anchor. |
| `class`    | `string`                           | `""`        | Merged into the panel classes.                                                                                                                                                       |

## Sub-components

- `DropdownMenu` — root wrapper, manages open state (`bind:open`, `class`)
- `DropdownMenuTrigger` — button that toggles the menu
- `DropdownMenuContent` — the popup panel (`align`, `side`, `floating`, `anchor`)
- `DropdownMenuItem` — individual menu action
- `DropdownMenuSeparator` — divider between items

## Usage

```svelte
<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
	} from "$lib/components/ui/dropdown-menu";
	import { Button } from "$lib/components/ui/button";
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		<Button variant="outline">Options</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuItem onclick={() => console.log("edit")}>Edit</DropdownMenuItem>
		<DropdownMenuItem onclick={() => console.log("copy")}>Copy</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem onclick={() => console.log("delete")}>Delete</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

## Alignment

```svelte
<!-- Align to the left -->
<DropdownMenuContent align="start">...</DropdownMenuContent>

<!-- Centered -->
<DropdownMenuContent align="center">...</DropdownMenuContent>
```

## Controlled Open State

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<DropdownMenu bind:open>...</DropdownMenu>

<p>Menu is {open ? "open" : "closed"}</p>
```

## Floating Mode (escape `overflow-hidden`)

By default `DropdownMenuContent` uses `position: absolute`, which is clipped by any ancestor with `overflow-hidden` — `Sidebar`, modal scroll containers, cards with rounded clipping, etc. Set `floating` to switch to `position: fixed`. Coordinates are computed from the trigger's `getBoundingClientRect()` and clamped to the viewport (8px margin). The menu re-positions on `scroll` and `resize`.

Pair with `side="top"` when the trigger sits at the bottom of its container (footer rows, popovers anchored to the page edge):

```svelte
<DropdownMenu>
	<DropdownMenuTrigger>Options</DropdownMenuTrigger>
	<DropdownMenuContent floating side="top" align="end">
		<DropdownMenuItem>Profile</DropdownMenuItem>
		<DropdownMenuItem>Sign out</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

## Anchoring to a Sub-Element

When the trigger is wide (e.g. a full-width row containing an avatar, name, and chevron), you often want the menu to open from one sub-element rather than the row as a whole. Pass any `HTMLElement` as `anchor` and the floating position is computed from that element's rect instead. Combine with `bind:open` to animate the sub-element with the menu state:

```svelte
<script lang="ts">
	import { ChevronUp } from "@lucide/svelte";

	let open = $state(false);
	let chevronEl: HTMLElement | undefined = $state();
</script>

<DropdownMenu bind:open class="block w-full">
	<DropdownMenuTrigger
		class="flex w-full items-center justify-between gap-2 rounded-md p-1 hover:bg-accent"
	>
		<span>User row content</span>
		<span
			bind:this={chevronEl}
			class="inline-flex shrink-0 items-center transition-transform duration-150"
			style:transform={open ? "rotate(0deg)" : "rotate(180deg)"}
		>
			<ChevronUp size={14} />
		</span>
	</DropdownMenuTrigger>
	<DropdownMenuContent floating side="top" align="end" anchor={chevronEl}>
		<DropdownMenuItem>Profile</DropdownMenuItem>
		<DropdownMenuItem>Sign out</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

Two gotchas:

- **`bind:this` doesn't work on Lucide icon components** — they're Svelte components, so `bind:this` gives the component instance, not the SVG. Wrap the icon in a `<span bind:this={...}>`.
- **`DropdownMenu` is `relative inline-block` by default** — for full-width triggers, pass `class="block w-full"` so the wrapper actually spans its parent and `justify-between` (or similar) has room to space children to opposite edges.
