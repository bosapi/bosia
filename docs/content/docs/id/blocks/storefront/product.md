---
title: Storefront — Product Page
description: Galeri lengket, buy box dengan opsi, baris kepercayaan, accordion detail, dan ulasan.
demo: StorefrontProductDemo
---

Blok penyusun halaman detail produk (PDP). Letakkan galeri dan buy box berdampingan, tumpuk
baris kepercayaan dan accordion di bawah opsi, lalu tutup dengan bagian ulasan.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/product-gallery
bun x bosia@latest add block storefront/product-options
bun x bosia@latest add block storefront/trust-row
bun x bosia@latest add block storefront/pdp-accordions
bun x bosia@latest add block storefront/reviews
```

`product-options` menarik `storefront/store`; semuanya menarik [`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import ProductGallery from "$lib/blocks/storefront/product-gallery/block.svelte";
	import ProductOptions from "$lib/blocks/storefront/product-options/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<div class="grid lg:grid-cols-[1.1fr_1fr] gap-12">
	<ProductGallery />
	<ProductOptions {cart} />
</div>
```

`product-options` menerima `product`, `sizes` opsional, dan `cart` bersama (tambah-ke-tas
menjumlahkan kuantitas yang dipilih). `pdp-accordions` memakai `<details>` native untuk bagian detail.

`reviews` tampil mandiri dengan ulasan contoh, atau kirim milikmu: `rating`, `count`,
`distribution` (persen per bintang, 5→1) dan `reviews` (`{ author, rating, date, title?, body,
verified? }`). Form tulis-ulasannya menambah ke daftar yang tampil dan memanggil
`onSubmit(review)` untuk penyimpanan sungguhan.

## Source

`src/lib/blocks/storefront/{product-gallery,product-options,trust-row,pdp-accordions,reviews}/block.svelte`
