---
title: Mode Switcher
description: Satu tombol yang menggilir tema antara terang, gelap, dan sistem, disimpan di localStorage.
demo: ModeSwitcherDemo
---

```bash
bun x bosia@latest add mode-switcher
```

Tombol ikon ghost yang menggilir tema warna antara terang → gelap → sistem setiap kali diklik.
Pilihannya disimpan ke `localStorage` di bawah kunci `theme` dan diterapkan lagi saat dimuat,
sehingga bertahan setelah halaman di-refresh. Saat mode sistem, ia juga mengikuti perubahan tema OS
secara langsung. Navbar memakai komponen ini secara internal.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { ModeSwitcher } from "$lib/components/ui/mode-switcher";
</script>

<ModeSwitcher />
```
