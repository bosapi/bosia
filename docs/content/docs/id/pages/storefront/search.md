---
title: Pages — Storefront Search
description: Halaman hasil pencarian dengan overlay command-palette, grid yang bisa diurut, dan keadaan tanpa-hasil.
demo: PagesSearchDemo
---

Halaman pencarian Mercato: ikon cari di header membuka overlay command-palette dengan pelengkapan
otomatis; memilih hasil atau mengirim teks bebas memfilter grid produk yang bisa diurut, dan empty
state tanpa-hasil menawarkan untuk menghapus pencarian.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/search
```

Menginstal `page.svelte` plus block storefront yang disusunnya.

## Usage

```svelte
<script lang="ts">
	import Search from "$lib/pages/storefront/search/page.svelte";
</script>

<Search />
```

Kueri diisi pada kunjungan pertama sehingga hasil langsung tampil. Overlay mencocokkan nama dan
kategori produk dengan navigasi keyboard (↑ ↓ Enter Esc); Enter dengan teks bebas menjalankannya
sebagai kueri halaman. Sambungkan `onSubmit` ke endpoint pencarian asli Anda bila sudah ada.

## Source

`src/lib/pages/storefront/search/page.svelte`
