---
title: Navbars — App & Interactive
description: Navbar app-shell dan interaktif — dashboard, e-commerce, docs, mega-menu, pengumuman, dan mobile.
demo: NavbarsAppDemo
---

Navbar untuk UI produk, dengan beberapa contoh interaktif. Masing-masing adalah Svelte `<header>`
mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di
setiap tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

Setiap navbar diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block navbars/dashboard
bun x bosia@latest add block navbars/ecommerce
bun x bosia@latest add block navbars/docs
bun x bosia@latest add block navbars/mega-menu
bun x bosia@latest add block navbars/announcement
bun x bosia@latest add block navbars/mobile
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`dashboard`** — breadcrumb, pencarian, ikon aksi dengan badge dan avatar.
- **`ecommerce`** — tautan kategori, pencarian produk, wishlist, akun, dan keranjang.
- **`docs`** — pill versi, pencarian, tautan, toggle terang/gelap, dan tautan repo.
- **`mega-menu`** — tautan katalog membuka panel dropdown tiga kolom.
- **`announcement`** — strip promo yang dapat ditutup di atas baris nav utama.
- **`mobile`** — hamburger mengalihkan menu overlay penuh dengan tautan bertumpuk.

## Usage

```svelte
<script lang="ts">
	import MegaMenu from "$lib/blocks/navbars/mega-menu/block.svelte";
</script>

<MegaMenu />
```

Toggle (pengalih tema, mega-menu, tutup pengumuman, menu mobile) hanyalah `$state` lokal kosmetik —
sambungkan ke data dan handler Anda sendiri. Sunting `block.svelte` untuk mengganti wordmark dan teks.

## Source

`src/lib/blocks/navbars/*/block.svelte`
