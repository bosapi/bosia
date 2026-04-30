---
title: Context Menu
description: A right-click context menu with items, labels, shortcuts, separators, and nested sub-menus.
demo: ContextMenuDemo
---

```bash
bosia add context-menu
```

A right-click triggered menu that appears at the cursor position. Supports items, labels, keyboard shortcut hints, separators, and nested sub-menus.

## Preview

## Sub-components

- `ContextMenu` — root wrapper, manages open state and cursor coordinates
- `ContextMenuTrigger` — wraps the right-clickable area
- `ContextMenuContent` — fixed-positioned panel at cursor coordinates
- `ContextMenuItem` — action item (optional `disabled` prop)
- `ContextMenuSeparator` — divider between items
- `ContextMenuLabel` — non-interactive group heading
- `ContextMenuShortcut` — keyboard hint displayed on the right
- `ContextMenuSub` — sub-menu state manager
- `ContextMenuSubTrigger` — item with arrow that opens a sub-menu
- `ContextMenuSubContent` — fly-out panel for sub-menu

## Usage

```svelte
<script lang="ts">
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuSeparator,
		ContextMenuLabel,
		ContextMenuShortcut,
	} from "$lib/components/ui/context-menu";
</script>

<ContextMenu>
	<ContextMenuTrigger>
		<div class="h-36 w-72 border border-dashed rounded-md flex items-center justify-center">
			Right click here
		</div>
	</ContextMenuTrigger>
	<ContextMenuContent>
		<ContextMenuLabel>Actions</ContextMenuLabel>
		<ContextMenuSeparator />
		<ContextMenuItem onclick={() => console.log("back")}>
			Back
			<ContextMenuShortcut>⌘[</ContextMenuShortcut>
		</ContextMenuItem>
		<ContextMenuItem onclick={() => console.log("reload")}>
			Reload
			<ContextMenuShortcut>⌘R</ContextMenuShortcut>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
```

## Sub-menus

```svelte
<script lang="ts">
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuSub,
		ContextMenuSubTrigger,
		ContextMenuSubContent,
	} from "$lib/components/ui/context-menu";
</script>

<ContextMenu>
	<ContextMenuTrigger>
		<div class="h-36 w-72 border border-dashed rounded-md flex items-center justify-center">
			Right click here
		</div>
	</ContextMenuTrigger>
	<ContextMenuContent>
		<ContextMenuItem>Back</ContextMenuItem>
		<ContextMenuSub>
			<ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
			<ContextMenuSubContent>
				<ContextMenuItem>Save Page As...</ContextMenuItem>
				<ContextMenuItem>Developer Tools</ContextMenuItem>
			</ContextMenuSubContent>
		</ContextMenuSub>
	</ContextMenuContent>
</ContextMenu>
```

## Disabled Items

```svelte
<ContextMenuItem disabled>Forward</ContextMenuItem>
```
