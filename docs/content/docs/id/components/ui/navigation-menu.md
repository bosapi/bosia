---
title: Navigation Menu
description: Navigasi tingkat atas horizontal dengan panel popover yang dipicu hover/fokus.
demo: NavigationMenuDemo
---

```bash
bun x bosia@latest add navigation-menu
```

Menu navigasi horizontal majemuk di mana tiap item bisa membuka popover berisi tautan terkait. Hanya satu panel terbuka pada satu waktu dan delay hover-intent kecil mencegah kedip saat kursor berpindah antara trigger dan panel.

## Preview

## Props

### NavigationMenu

| Prop         | Type             | Default |
| ------------ | ---------------- | ------- |
| `value`      | `string \| null` | `null`  |
| `openDelay`  | `number`         | `150`   |
| `closeDelay` | `number`         | `200`   |
| `class`      | `string`         | `""`    |

## Sub-komponen

- `NavigationMenu` — root `<nav aria-label="Main">`, penyedia konteks yang melacak item terbuka tunggal dan menangani klik-di-luar + tutup Escape
- `NavigationMenuList` — kontainer flex `<ul>`
- `NavigationMenuItem` — `<li>` yang menghasilkan id stabil dan menampung jembatan hover
- `NavigationMenuTrigger` — `<button>` dengan `aria-expanded`, `aria-controls`, chevron berputar, dan `ArrowDown` untuk memfokuskan tautan pertama di dalam panel
- `NavigationMenuContent` — popover berposisi absolut; menutup saat Escape dan mengembalikan fokus ke trigger-nya
- `NavigationMenuLink` — anchor blok dengan ring `focus-visible`

## Penggunaan

```svelte
<script lang="ts">
	import {
		NavigationMenu,
		NavigationMenuList,
		NavigationMenuItem,
		NavigationMenuTrigger,
		NavigationMenuContent,
		NavigationMenuLink,
	} from "$lib/components/ui/navigation-menu";
</script>

<NavigationMenu>
	<NavigationMenuList>
		<NavigationMenuItem>
			<NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
			<NavigationMenuContent>
				<ul class="grid w-[420px] gap-3">
					<li>
						<NavigationMenuLink href="/getting-started">Introduction</NavigationMenuLink>
					</li>
					<li>
						<NavigationMenuLink href="/project-structure">Project Structure</NavigationMenuLink>
					</li>
				</ul>
			</NavigationMenuContent>
		</NavigationMenuItem>

		<NavigationMenuItem>
			<NavigationMenuLink
				href="/docs"
				class="inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
			>
				Docs
			</NavigationMenuLink>
		</NavigationMenuItem>
	</NavigationMenuList>
</NavigationMenu>
```

## Delay Hover

`openDelay` mengontrol berapa lama pointer harus berhenti di trigger sebelum panel pertama terbuka. `closeDelay` memberi pengguna masa tenggang untuk memindahkan kursor dari trigger ke panel (sang "hover bridge").

Berpindah antar item yang sudah terbuka selalu instan — pengguna mengharapkan navigasi horizontal yang gesit setelah menu muncul.

```svelte
<NavigationMenu openDelay={200} closeDelay={150}>
	<!-- ... -->
</NavigationMenu>
```

## Terkontrol

Ikat `value` untuk melacak atau menyetel id item yang sedang terbuka.

```svelte
<script lang="ts">
	let value = $state<string | null>(null);
</script>

<NavigationMenu bind:value>
	<!-- ... -->
</NavigationMenu>

<p>Open item: {value ?? "none"}</p>
```

## Keyboard

| Tombol      | Aksi                                                                |
| ----------- | ------------------------------------------------------------------- |
| `Tab`       | Pindahkan fokus ke trigger atau tautan berikutnya                   |
| `ArrowDown` | Pada trigger, membuka panel dan memfokuskan tautan pertama di dalam |
| `Escape`    | Menutup panel terbuka dan mengembalikan fokus ke trigger-nya        |
