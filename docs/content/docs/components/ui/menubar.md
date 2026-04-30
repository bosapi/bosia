---
title: Menubar
description: A horizontal menu bar with multiple dropdown menus, supporting hover-switch between open menus.
demo: MenubarDemo
---

```bash
bosia add menubar
```

A horizontal menu bar with multiple dropdown menus. Click to open a menu, then hover between triggers to switch. Handles click-outside and Escape to close.

## Preview

## Props

### MenubarContent

| Prop    | Type                               | Default   |
| ------- | ---------------------------------- | --------- |
| `align` | `"start"` \| `"end"` \| `"center"` | `"start"` |
| `class` | `string`                           | `""`      |

## Sub-components

- `Menubar` — root bar, manages active menu state
- `MenubarMenu` — per-menu group, provides menu context
- `MenubarTrigger` — click to open; hover-switches when another menu is active
- `MenubarContent` — dropdown panel (`align`: `"start"` | `"end"` | `"center"`)
- `MenubarItem` — action item, auto-closes menu on click
- `MenubarSeparator` — divider between items
- `MenubarLabel` — non-interactive section header
- `MenubarShortcut` — keyboard shortcut display
- `MenubarSub` — wrapper for a nested sub-menu
- `MenubarSubTrigger` — item that opens a sub-menu (shows `›` chevron)
- `MenubarSubContent` — sub-menu panel, flies out to the right

## Usage

```svelte
<script lang="ts">
	import {
		Menubar,
		MenubarMenu,
		MenubarTrigger,
		MenubarContent,
		MenubarItem,
		MenubarSeparator,
		MenubarLabel,
		MenubarShortcut,
		MenubarSub,
		MenubarSubTrigger,
		MenubarSubContent,
	} from "$lib/components/ui/menubar";
</script>

<Menubar>
	<MenubarMenu>
		<MenubarTrigger>File</MenubarTrigger>
		<MenubarContent>
			<MenubarItem>
				New File
				<MenubarShortcut>⌘N</MenubarShortcut>
			</MenubarItem>
			<MenubarSeparator />
			<MenubarItem>Save</MenubarItem>
		</MenubarContent>
	</MenubarMenu>

	<MenubarMenu>
		<MenubarTrigger>Edit</MenubarTrigger>
		<MenubarContent>
			<MenubarLabel>Actions</MenubarLabel>
			<MenubarItem>Undo</MenubarItem>
			<MenubarItem>Redo</MenubarItem>
		</MenubarContent>
	</MenubarMenu>
</Menubar>
```
