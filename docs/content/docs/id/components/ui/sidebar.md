---
title: Sidebar
description: Sidebar komposabel dengan header, konten, grup, menu, dan mode ikon yang collapsible.
demo: SidebarDemo
---

```bash
bun x bosia@latest add sidebar
```

Sidebar komposabel dengan header, konten yang bisa di-scroll, menu berkelompok, item collapsible, dan collapse mode-ikon. Memakai properti kustom CSS `sidebar-*` untuk tema.

## Preview

## Penggunaan Dasar

```svelte
<script lang="ts">
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarMenu,
		SidebarMenuItem,
		SidebarFooter,
	} from "$lib/components/ui/sidebar";
</script>

<div class="flex h-screen">
	<Sidebar>
		<SidebarHeader>
			<div class="flex items-center gap-2">
				<img src="/logo-dark.svg" alt="Bosia" class="hidden h-5 w-5 dark:block" />
				<img src="/logo-light.svg" alt="Bosia" class="block h-5 w-5 dark:hidden" />
				<span class="text-lg font-bold">Bosia</span>
			</div>
		</SidebarHeader>

		<SidebarContent>
			<SidebarGroup label="Navigation">
				<SidebarMenu>
					<SidebarMenuItem href="/" label="Home" active />
					<SidebarMenuItem href="/dashboard" label="Dashboard" />
					<SidebarMenuItem href="/settings" label="Settings" />
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<p class="text-xs text-muted-foreground">v0.1.0</p>
		</SidebarFooter>
	</Sidebar>

	<main class="flex-1 p-6">
		<!-- Page content -->
	</main>
</div>
```

## Memilih bentuk item yang tepat

`SidebarMenuItem` bercabang otomatis berdasarkan prop-nya — Anda tidak memilih komponen berbeda untuk daun vs. parent. Pilih bentuknya dari apa yang perlu dilakukan item:

| Kasus penggunaan                                          | Pola                                                                                                                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tautan biasa (Dashboard, Settings)                        | `<SidebarMenuItem href="/x" label="X" />` — berikan `href`, tanpa children.                                                                                          |
| Bagian dengan sub-halaman (Analytics → Overview, Reports) | `<SidebarMenuItem label="X">…item bersarang…</SidebarMenuItem>` — berikan children, tanpa `href`. Otomatis menjadi accordion saat diperluas, popover saat collapsed. |
| Hanya-label (petunjuk grup, tanpa nav)                    | `<SidebarMenuItem label="X" />` — tanpa `href`, tanpa children.                                                                                                      |

> **Jangan pernah membungkus `SidebarMenuItem` di dalam `DropdownMenu` atau trigger lain mana pun.** Komponen menangani percabangan parent/daun secara internal — membungkus daun di `DropdownMenu` menelan `href` dan merusak tautan.

## Sub-komponen

| Komponen          | Deskripsi                                                          |
| ----------------- | ------------------------------------------------------------------ |
| `Sidebar`         | Kontainer root dengan dukungan collapse                            |
| `SidebarHeader`   | Bagian atas dengan border-bottom                                   |
| `SidebarContent`  | Area tengah yang bisa di-scroll                                    |
| `SidebarFooter`   | Bagian bawah dengan border-top                                     |
| `SidebarGroup`    | Mengelompokkan item di bawah label huruf-besar opsional            |
| `SidebarMenu`     | Wrapper `<ul>` untuk item menu                                     |
| `SidebarMenuItem` | Item tautan, button, atau teks statis dengan snippet ikon opsional |
| `SidebarTrigger`  | Tombol toggle — tempatkan di area konten utama Anda                |

## Props Sidebar

| Prop          | Type                  | Default  |
| ------------- | --------------------- | -------- |
| `side`        | `"left"` \| `"right"` | `"left"` |
| `collapsible` | `"icon"` \| `"none"`  | `"icon"` |
| `collapsed`   | `boolean` (bindable)  | `false`  |

## Item Menu Collapsible

`SidebarMenuItem` mendukung children bersarang untuk sub-menu collapsible:

```svelte
<SidebarMenuItem label="Analytics">
	<SidebarMenuItem href="/analytics/overview" label="Overview" />
	<SidebarMenuItem href="/analytics/reports" label="Reports" />
</SidebarMenuItem>
```

### Snippet Ikon

Prop `icon` menerima sebuah snippet Svelte:

```svelte
<SidebarMenuItem href="/" label="Home" active>
	{#snippet icon()}
		<Icon name="home" size={16} />
	{/snippet}
</SidebarMenuItem>
```

## Sub-Menu Popover saat Collapsed

Saat sidebar collapsed ke mode ikon, item menu parent (yang punya children) menampilkan **popover** saat diklik alih-alih accordion inline. Popover muncul di kanan dengan label item sebagai header dan semua children dirender sebagai tautan yang diperluas. Klik di luar atau tekan Escape untuk menutup.

Perilaku ini otomatis — tanpa prop tambahan.

### Trigger Hover

Setel `trigger="hover"` pada `SidebarMenuItem` untuk membuka popover collapsed-nya saat hover alih-alih klik. Popover tetap terbuka selama kursor di atas trigger atau konten popover, dan menutup setelah delay singkat saat kursor pergi. Di perangkat sentuh, mode hover turun ke tap-to-toggle.

```svelte
<SidebarMenuItem label="Models" trigger="hover">
	{#snippet icon()}<Icon name="package" size={16} />{/snippet}
	<SidebarMenuItem href="#" label="Genesis" />
	<SidebarMenuItem href="#" label="Explorer" />
</SidebarMenuItem>
```

| Prop      | Type                   | Default   |
| --------- | ---------------------- | --------- |
| `trigger` | `"click"` \| `"hover"` | `"click"` |

## Footer Pengguna

Tempatkan pengguna yang sedang masuk di bagian bawah sidebar. Varian statis — baris avatar + nama + email yang menciut menjadi hanya avatar dalam mode ikon. Gunakan `getSidebarContext()` untuk membaca `collapsed`:

```svelte
<script lang="ts">
	import { SidebarFooter, getSidebarContext } from "$lib/components/ui/sidebar";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";

	let { user }: { user: { name: string; email: string; avatar?: string } } = $props();
	const sidebar = getSidebarContext();
</script>

<SidebarFooter>
	<div class="flex items-center gap-2">
		<Avatar src={user.avatar} alt={user.name}>
			<AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
		{#if !sidebar.collapsed}
			<div class="flex flex-1 flex-col leading-tight">
				<span class="text-sm font-medium">{user.name}</span>
				<span class="text-xs text-muted-foreground">{user.email}</span>
			</div>
		{/if}
	</div>
</SidebarFooter>
```

## Menu Pengguna (Profile / Logout)

Komposisikan `SidebarFooter` dengan `DropdownMenu` agar baris pengguna menjadi trigger menu sungguhan — Profile / Settings / Sign out.

> **Gunakan `floating` dan `side="top"` pada `DropdownMenuContent`.** Pemosisian absolut default ter-clip oleh `overflow-hidden` milik `Sidebar`. `floating` mengalihkan menu ke `position: fixed` (dihitung dari rect trigger) agar lolos dari batas sidebar, dan `side="top"` membukanya ke atas — menjauh dari tepi bawah.

```svelte
<script lang="ts">
	import { SidebarFooter, getSidebarContext } from "$lib/components/ui/sidebar";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
	} from "$lib/components/ui/dropdown-menu";
	import { ChevronUp } from "@lucide/svelte";

	let {
		user,
		onLogout,
	}: {
		user: { name: string; email: string; avatar?: string };
		onLogout: () => void;
	} = $props();

	const sidebar = getSidebarContext();
	let open = $state(false);
	let chevronEl: HTMLElement | undefined = $state();
</script>

<SidebarFooter>
	<DropdownMenu bind:open class="block w-full">
		<DropdownMenuTrigger
			class="flex w-full items-center justify-between gap-2 rounded-md p-1 hover:bg-sidebar-accent"
		>
			<div class="flex min-w-0 items-center gap-2">
				<Avatar src={user.avatar} alt={user.name} class="h-8 w-8">
					<AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
				{#if !sidebar.collapsed}
					<div class="flex min-w-0 flex-col text-left leading-tight">
						<span class="truncate text-sm font-medium">{user.name}</span>
						<span class="truncate text-xs text-muted-foreground">{user.email}</span>
					</div>
				{/if}
			</div>
			{#if !sidebar.collapsed}
				<span
					bind:this={chevronEl}
					class="inline-flex shrink-0 items-center text-muted-foreground transition-transform duration-150"
					style:transform={open ? "rotate(0deg)" : "rotate(180deg)"}
				>
					<ChevronUp size={14} />
				</span>
			{/if}
		</DropdownMenuTrigger>
		<DropdownMenuContent floating side="top" align="end" anchor={chevronEl} class="min-w-48">
			<DropdownMenuItem href="/profile">Profile</DropdownMenuItem>
			<DropdownMenuItem href="/settings">Settings</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={onLogout}>Sign out</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</SidebarFooter>
```

Yang menjadi tumpuan di sini:

- **`class="block w-full"` pada `DropdownMenu`** — root-nya `inline-block` secara default, jadi `w-full` trigger dalam menciut ke lebar-konten. Timpa dengan `block w-full` agar trigger benar-benar memenuhi footer; baru kemudian `justify-between` mendorong chevron ke tepi kanan.
- **`justify-between` pada trigger** dengan dua children (grup avatar+teks, chevron) menyebarkannya ke tepi berlawanan. `min-w-0` + `truncate` pada flex dalam mencegah email panjang mendorong chevron keluar layar.
- **`anchor={chevronEl}` pada `DropdownMenuContent`** — secara default menu memposisikan dari rect tombol trigger (sehingga menu akan berada di atas avatar). Memberikan elemen berbeda sebagai `anchor` mengaitkan ulang menu floating ke rect elemen itu. Bungkus ikon dalam `<span>` dan `bind:this={chevronEl}` karena komponen lucide tidak memunculkan SVG dasarnya via `bind:this`.
- **`bind:open` + `style:transform`** memutar chevron seiring state menu — menunjuk ke bawah saat tertutup, ke atas saat terbuka.

Instal dependensi jika belum ada:

```bash
bun x bosia@latest add sidebar dropdown-menu avatar
```

## Sidebar Sisi-Kanan

```svelte
<Sidebar side="right">...</Sidebar>
```

## SidebarTrigger

Tombol toggle bergaya siap pakai. Tempatkan di area konten utama Anda dan sambungkan ke state `collapsed` sidebar:

```svelte
<script lang="ts">
	import { Sidebar, SidebarTrigger } from "$lib/components/ui/sidebar";

	let collapsed = $state(false);
</script>

<div class="flex h-screen">
	<Sidebar collapsible="icon" bind:collapsed>...</Sidebar>

	<main class="flex-1 p-6">
		<SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />
		<!-- Page content -->
	</main>
</div>
```

## Mengakses State Sidebar

Gunakan `getSidebarContext()` di komponen mana pun di dalam pohon sidebar untuk membaca `collapsed` atau memanggil `toggle()`:

```svelte
<script lang="ts">
	import { getSidebarContext } from "$lib/components/ui/sidebar";

	const sidebar = getSidebarContext();
</script>

{#if !sidebar.collapsed}
	<span>Visible when expanded</span>
{/if}
```

## Collapse Terkontrol

```svelte
<script lang="ts">
	let collapsed = $state(false);
</script>

<Sidebar bind:collapsed>...</Sidebar>

<button onclick={() => (collapsed = !collapsed)}>Toggle</button>
```

## Properti Kustom CSS

Beri style sidebar memakai variabel CSS ini di `app.css` Anda:

```css
:root {
	--sidebar-width: 16rem;
	--sidebar-width-icon: 3rem;
	--color-sidebar: var(--color-background);
	--color-sidebar-foreground: var(--color-foreground);
	--color-sidebar-accent: var(--color-accent);
	--color-sidebar-accent-foreground: var(--color-accent-foreground);
}
```
