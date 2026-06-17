---
title: Context Menu
description: Menu konteks klik-kanan dengan item, label, shortcut, separator, dan sub-menu bersarang.
demo: ContextMenuDemo
---

```bash
bun x bosia@latest add context-menu
```

Menu yang dipicu klik-kanan yang muncul di posisi kursor. Mendukung item, label, petunjuk shortcut keyboard, separator, dan sub-menu bersarang.

## Preview

## Sub-komponen

- `ContextMenu` — wrapper root, mengelola state open dan koordinat kursor
- `ContextMenuTrigger` — membungkus area yang bisa diklik-kanan
- `ContextMenuContent` — panel berposisi tetap di koordinat kursor
- `ContextMenuItem` — item aksi (prop `disabled` opsional)
- `ContextMenuSeparator` — pembatas antar item
- `ContextMenuLabel` — heading grup non-interaktif
- `ContextMenuShortcut` — petunjuk keyboard yang ditampilkan di kanan
- `ContextMenuSub` — pengelola state sub-menu
- `ContextMenuSubTrigger` — item dengan panah yang membuka sub-menu
- `ContextMenuSubContent` — panel fly-out untuk sub-menu

## Penggunaan

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

## Sub-menu

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

## Item Nonaktif

```svelte
<ContextMenuItem disabled>Forward</ContextMenuItem>
```
