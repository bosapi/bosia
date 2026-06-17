---
title: Navbar
description: Navbar responsif dengan tautan desktop, menu dropdown mobile, toggle tema, dan avatar pengguna.
demo: NavbarDemo
---

```bash
bun x bosia@latest add navbar
```

Bilah navigasi responsif dengan baris tautan desktop, menu hamburger mobile, toggle tema yang menyiklus Light / Dark / System (menyimpan pilihan Anda dan mengikuti OS saat dalam mode System), dan dropdown avatar pengguna opsional. Otomatis menginstal dependensi: `button`, `avatar`, `dropdown-menu`, dan paket npm [`@lucide/svelte`](/components/ui/icon/).

## Preview

## Penggunaan Dasar

```svelte
<script lang="ts">
	import { Navbar } from "$lib/components/ui/navbar";

	const links = [
		{ label: "Home", href: "/" },
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Settings", href: "/settings" },
	];
</script>

<Navbar {links} currentPath="/" />
```

## Props

| Prop          | Type                                                                 | Default     |
| ------------- | -------------------------------------------------------------------- | ----------- |
| `brand`       | `string`                                                             | `"Bosia"`   |
| `version`     | `string`                                                             | `""`        |
| `links`       | `{ label: string; href: string }[]`                                  | `[]`        |
| `currentPath` | `string`                                                             | `"/"`       |
| `user`        | `{ name: string; email: string; initials: string; avatar?: string }` | `undefined` |

## Dengan Avatar Pengguna

Saat `user` diberikan, sebuah menu dropdown muncul dengan item Profile, Settings, dan Log out:

```svelte
<Navbar
	{links}
	currentPath="/"
	user={{ name: "Jeki", email: "jeki@bosia.dev", initials: "J", avatar: "/favicon.svg" }}
/>
```

## Branding Kustom

```svelte
<Navbar brand="My App" version="v1.0" {links} currentPath="/" />
```

## Slot Aksi Tambahan

Gunakan slot children untuk menambahkan aksi kustom (mis. lonceng notifikasi) ke sisi kanan navbar:

```svelte
<Navbar {links} currentPath="/">
	<Button variant="ghost" size="icon" aria-label="Notifications">🔔</Button>
</Navbar>
```

## Sub-komponen

- `Navbar` — navbar responsif utama
- `NavbarLink` — tautan nav individual dengan styling state aktif
- `NavbarMobileMenu` — dropdown hamburger untuk viewport mobile (tersembunyi pada `md:` ke atas)

### Memakai NavbarLink Langsung

```svelte
<script lang="ts">
	import { NavbarLink } from "$lib/components/ui/navbar";
</script>

<NavbarLink href="/about" label="About" active={false} />
```
