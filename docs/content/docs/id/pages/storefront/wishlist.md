---
title: Pages — Storefront Wishlist
description: Halaman wishlist dengan grid produk favorit, pindah-ke-tas, dan empty state.
demo: PagesWishlistDemo
---

Wishlist Mercato: header, grid produk favorit dengan aksi "Move to bag", empty state saat daftar
dikosongkan, bagian newsletter, dan drawer keranjang bersama.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/wishlist
```

Menginstal `page.svelte` plus block storefront yang disusunnya.

## Usage

```svelte
<script lang="ts">
	import Wishlist from "$lib/pages/storefront/wishlist/page.svelte";
</script>

<Wishlist />
```

Beberapa favorit diisi pada kunjungan pertama. "Move to bag" menambah item ke keranjang, membuka
drawer, dan menghapusnya dari daftar; memberi hati pada produk dari halaman lain menambahkannya ke
sini — favorit tersimpan di `localStorage` lewat store bersama.

## Source

`src/lib/pages/storefront/wishlist/page.svelte`
