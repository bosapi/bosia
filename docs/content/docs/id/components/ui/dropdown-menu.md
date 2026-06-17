---
title: Dropdown Menu
description: Menu dropdown yang dikelola konteks dengan trigger, konten, item, dan separator.
demo: DropdownMenuDemo
---

```bash
bun x bosia@latest add dropdown-menu
```

Dropdown yang dikelola konteks dengan trigger, konten, item, dan separator. Menangani klik-di-luar dan Escape untuk menutup.

## Preview

## Props

### DropdownMenu

| Prop    | Type      | Default | Deskripsi                                                                                                                                                 |
| ------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`  | `boolean` | `false` | Bindable. Mencerminkan apakah menu terbuka — berguna untuk menganimasikan trigger (mis. memutar chevron) atau mengontrol menu secara programatik.         |
| `class` | `string`  | `""`    | Diterapkan ke wrapper. Default-nya `relative inline-block`; berikan `block w-full` saat trigger perlu memenuhi parent-nya (mis. di dalam footer sidebar). |

### DropdownMenuContent

| Prop       | Type                               | Default     | Deskripsi                                                                                                                                                                  |
| ---------- | ---------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `align`    | `"start"` \| `"end"` \| `"center"` | `"end"`     | Perataan horizontal relatif terhadap anchor.                                                                                                                               |
| `side`     | `"top"` \| `"bottom"`              | `"bottom"`  | Buka di atas (`"top"`) atau di bawah (`"bottom"`) anchor. Hanya bermakna dengan `floating`.                                                                                |
| `floating` | `boolean`                          | `false`     | Mengalihkan menu ke `position: fixed` agar lolos dari ancestor dengan `overflow-hidden` (mis. di dalam `Sidebar`). Koordinat dihitung dari bounding rect anchor.           |
| `anchor`   | `HTMLElement \| undefined`         | `undefined` | Saat diset (dan `floating` `true`), menu terbuka dari rect elemen ini alih-alih rect trigger. Berguna saat hanya sub-elemen trigger (seperti chevron) yang menjadi anchor. |
| `class`    | `string`                           | `""`        | Digabung ke kelas panel.                                                                                                                                                   |

## Sub-komponen

- `DropdownMenu` — wrapper root, mengelola state open (`bind:open`, `class`)
- `DropdownMenuTrigger` — tombol yang membuka menu
- `DropdownMenuContent` — panel popup (`align`, `side`, `floating`, `anchor`)
- `DropdownMenuItem` — aksi menu individual
- `DropdownMenuSeparator` — pembatas antar item

## Penggunaan

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

## Perataan

```svelte
<!-- Align to the left -->
<DropdownMenuContent align="start">...</DropdownMenuContent>

<!-- Centered -->
<DropdownMenuContent align="center">...</DropdownMenuContent>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<DropdownMenu bind:open>...</DropdownMenu>

<p>Menu is {open ? "open" : "closed"}</p>
```

## Mode Floating (lolos `overflow-hidden`)

Secara default `DropdownMenuContent` memakai `position: absolute`, yang ter-clip oleh ancestor mana pun dengan `overflow-hidden` — `Sidebar`, kontainer scroll modal, card dengan clipping membulat, dll. Setel `floating` untuk beralih ke `position: fixed`. Koordinat dihitung dari `getBoundingClientRect()` trigger dan dijepit ke viewport (margin 8px). Menu memposisikan ulang saat `scroll` dan `resize`.

Pasangkan dengan `side="top"` saat trigger berada di bagian bawah kontainernya (baris footer, popover yang terpaut ke tepi halaman):

```svelte
<DropdownMenu>
	<DropdownMenuTrigger>Options</DropdownMenuTrigger>
	<DropdownMenuContent floating side="top" align="end">
		<DropdownMenuItem>Profile</DropdownMenuItem>
		<DropdownMenuItem>Sign out</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

## Mengaitkan ke Sub-Elemen

Saat trigger lebar (mis. baris selebar penuh berisi avatar, nama, dan chevron), Anda sering ingin menu terbuka dari satu sub-elemen alih-alih dari baris secara keseluruhan. Berikan `HTMLElement` apa pun sebagai `anchor` dan posisi floating dihitung dari rect elemen itu. Gabungkan dengan `bind:open` untuk menganimasikan sub-elemen seiring state menu:

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

Dua hal yang perlu diwaspadai:

- **`bind:this` tidak berfungsi pada komponen ikon Lucide** — keduanya komponen Svelte, jadi `bind:this` memberi instance komponen, bukan SVG. Bungkus ikon dalam `<span bind:this={...}>`.
- **`DropdownMenu` adalah `relative inline-block` secara default** — untuk trigger selebar penuh, berikan `class="block w-full"` agar wrapper benar-benar memenuhi parent-nya dan `justify-between` (atau serupa) punya ruang untuk menyebar children ke tepi berlawanan.
