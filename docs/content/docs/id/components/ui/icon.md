---
title: Icons
description: Gunakan @lucide/svelte untuk ikon — komponen Svelte tree-shakeable dari katalog Lucide.
---

> **Gunakan `@lucide/svelte` — jangan instal `lucide-svelte`.** Paket `lucide-svelte` tanpa scope sudah deprecated. Selalu gunakan paket berscope `@lucide/svelte`.

Bosia tidak menyertakan komponen `<Icon>` kustom. Tarik ikon langsung dari [`@lucide/svelte`](https://lucide.dev/icons) — setiap ikon adalah komponen Svelte tree-shakeable-nya sendiri, jadi hanya ikon yang Anda impor yang masuk ke bundle Anda.

## Instalasi

```bash
bun add @lucide/svelte
```

Komponen registry yang membutuhkan ikon (mis. `navbar`, `select`, `accordion`) mendeklarasikan `@lucide/svelte` di `npmDeps` mereka sendiri, jadi `bosia add` memasangnya untuk Anda.

## Penggunaan

Impor ikon yang Anda butuhkan berdasarkan nama PascalCase-nya:

```svelte
<script lang="ts">
	import { ChevronLeft, Search, Settings } from "@lucide/svelte";
</script>

<ChevronLeft size={18} class="text-muted-foreground" />
<Search size={20} />
<Settings size={16} class="opacity-70" />
```

## Props umum

| Prop          | Type               | Default          | Catatan                                                 |
| ------------- | ------------------ | ---------------- | ------------------------------------------------------- |
| `size`        | `number \| string` | `24`             | Lebar/tinggi dalam px (atau panjang CSS valid apa pun). |
| `color`       | `string`           | `"currentColor"` | Warna stroke.                                           |
| `strokeWidth` | `number \| string` | `2`              | Lebar stroke SVG.                                       |
| `class`       | `string`           | —                | Kelas Tailwind; mendukung util warna + ukuran.          |

Anda juga bisa memberikan atribut SVG standar apa pun (`aria-hidden`, `role`, `focusable`, dll.).

## Dengan Button

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Menu } from "@lucide/svelte";
</script>

<Button variant="ghost" size="icon" aria-label="Open menu">
	<Menu size={18} />
</Button>
```

## Ikon dinamis

Saat nama ikon datang dari data, buatlah peta lookup kecil berisi komponen — jangan pernah me-lookup berdasarkan string saat runtime:

```svelte
<script lang="ts">
	import { Home, Users, Settings } from "@lucide/svelte";
	import type { Component } from "svelte";

	const icons: Record<string, Component> = {
		home: Home,
		users: Users,
		settings: Settings,
	};

	let { nav }: { nav: Array<{ label: string; icon: string }> } = $props();
</script>

{#each nav as item}
	{@const Icon = icons[item.icon]}
	<Icon class="size-4" />
	{item.label}
{/each}
```

## Menjelajahi katalog

Semua ikon yang tersedia (dan namanya) ada di [lucide.dev/icons](https://lucide.dev/icons). Nama di situs memakai kebab-case (mis. `chevron-left`); komponen Svelte-nya PascalCase (`ChevronLeft`).
