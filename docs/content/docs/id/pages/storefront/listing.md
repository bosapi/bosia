---
title: Pages — Storefront Listing
description: Halaman daftar produk dengan filter, urut, dan grid responsif.
demo: PagesListingDemo
---

Halaman daftar produk Mercato (PLP): header, breadcrumb dan bilah urut, sidebar filter lengket, dan
grid produk yang dapat diurutkan, dirangkai ke keranjang bersama.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/listing
```

Menginstal `page.svelte` plus block storefront yang disusunnya.

## Usage

```svelte
<script lang="ts">
	import Listing from "$lib/pages/storefront/listing/page.svelte";
</script>

<Listing />
```

Halaman mem-bind nilai bilah urut dan mengurutkan ulang grid (unggulan, harga, rating tertinggi).
Filter menyimpan state lokalnya sendiri — sambungkan ke data Anda saat menghubungkan katalog asli.

## Source

`src/lib/pages/storefront/listing/page.svelte`
