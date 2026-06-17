---
title: Pages — Storefront Product
description: Halaman detail produk dengan galeri, buy box, sinyal kepercayaan, dan koleksi terkait.
demo: PagesProductDemo
---

Halaman detail produk Mercato (PDP): header, breadcrumb, galeri lengket, buy box dengan opsi, baris
kepercayaan, accordion detail, koleksi terkait, dan drawer keranjang bersama.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/product
```

Menginstal `page.svelte` plus block storefront yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Product from "$lib/pages/storefront/product/page.svelte";
</script>

<Product />
```

Halaman memakai item katalog pertama sebagai produk dan beberapa berikutnya sebagai koleksi terkait.
Menambah ke tas menjumlahkan kuantitas yang dipilih dan membuka drawer keranjang.

## Source

`src/lib/pages/storefront/product/page.svelte`
