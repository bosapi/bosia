---
title: Storefront — Catalog & Cart
description: Kartu dan grid produk, koleksi unggulan, store keranjang bersama, dan drawer keranjang.
demo: StorefrontCatalogDemo
---

Bagian-bagian produk, semua dirangkai ke satu keranjang bersama. Modul `storefront/store` adalah
store runes Svelte 5 (keranjang, favorit, flag drawer) dengan persistensi localStorage dan katalog
contoh — buat satu instance dan teruskan ke bawah.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/product-card
bun x bosia@latest add block storefront/product-grid
bun x bosia@latest add block storefront/featured-collection
bun x bosia@latest add block storefront/cart-drawer
```

Menginstal salah satunya menarik `storefront/store` otomatis. `product-grid` menyertakan
`product-card`; `featured-collection` membungkus `product-grid` dengan sebuah heading.

## Usage

```svelte
<script lang="ts">
	import FeaturedCollection from "$lib/blocks/storefront/featured-collection/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart, sampleProducts } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<FeaturedCollection products={sampleProducts} {cart} />
<CartDrawer {cart} />
```

Teruskan `cart` yang sama ke header, setiap grid, dan drawer agar tetap sinkron. Tanpa `cart`,
setiap block mundur ke state lokal sehingga tetap dirender berdiri sendiri. Drawer bersifat
`position: fixed` dan terbuka saat item ditambahkan (atau lewat `cart.open = true`).

## Source

`src/lib/blocks/storefront/{store,product-card,product-grid,featured-collection,cart-drawer}/`
