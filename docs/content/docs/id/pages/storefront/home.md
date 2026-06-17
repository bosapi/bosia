---
title: Pages — Storefront Home
description: Halaman beranda storefront serbaguna yang disusun dari block storefront.
demo: PagesHomeDemo
---

Beranda Mercato: header, hero, ubin kategori, koleksi unggulan, baris nilai, promo, editorial,
testimoni, newsletter, footer, dan drawer keranjang bersama.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/home
```

Menginstal `page.svelte` plus setiap block storefront yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Home from "$lib/pages/storefront/home/page.svelte";
</script>

<Home />
```

Ubah purpose toko dengan menyunting konstanta `purpose` di bagian atas `page.svelte` (lihat
[ringkasan](/pages/overview)); pasangkan dengan tema yang sesuai. Satu `createCart()` dibagi oleh
header, koleksi unggulan, dan drawer keranjang.

## Source

`src/lib/pages/storefront/home/page.svelte`
