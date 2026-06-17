---
title: Menubar
description: Bilah menu horizontal dengan beberapa menu dropdown, mendukung hover-switch antar menu yang terbuka.
demo: MenubarDemo
---

```bash
bun x bosia@latest add menubar
```

Bilah menu horizontal dengan beberapa menu dropdown. Klik untuk membuka menu, lalu hover antar trigger untuk berganti. Menangani klik-di-luar dan Escape untuk menutup.

## Preview

## Props

### MenubarContent

| Prop    | Type                               | Default   |
| ------- | ---------------------------------- | --------- |
| `align` | `"start"` \| `"end"` \| `"center"` | `"start"` |
| `class` | `string`                           | `""`      |

## Sub-komponen

- `Menubar` — bilah root, mengelola state menu aktif
- `MenubarMenu` — grup per-menu, menyediakan konteks menu
- `MenubarTrigger` — klik untuk membuka; hover-switch saat menu lain aktif
- `MenubarContent` — panel dropdown (`align`: `"start"` | `"end"` | `"center"`)
- `MenubarItem` — item aksi, otomatis menutup menu saat diklik
- `MenubarSeparator` — pembatas antar item
- `MenubarLabel` — heading bagian non-interaktif
- `MenubarShortcut` — tampilan shortcut keyboard
- `MenubarSub` — wrapper untuk sub-menu bersarang
- `MenubarSubTrigger` — item yang membuka sub-menu (menampilkan chevron `›`)
- `MenubarSubContent` — panel sub-menu, fly-out ke kanan

## Penggunaan

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
