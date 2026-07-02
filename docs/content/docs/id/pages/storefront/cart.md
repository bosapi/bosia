---
title: Pages — Storefront Cart
description: Halaman keranjang dengan baris item, stepper kuantitas, ringkasan pesanan lengket, dan empty state.
demo: PagesCartDemo
---

Halaman keranjang Mercato: header, baris item lebar penuh dengan stepper kuantitas dan hapus,
ringkasan pesanan lengket dengan kode promo dan CTA "Checkout", empty state saat tas dikosongkan,
dan koleksi terkait.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/cart
```

Menginstal `page.svelte` plus block storefront yang disusunnya.

## Usage

```svelte
<script lang="ts">
	import Cart from "$lib/pages/storefront/cart/page.svelte";
</script>

<Cart />
```

Tas diisi dari katalog pada kunjungan pertama; ongkir gratis di atas $50. Menghapus semua baris
menampilkan empty state, dan koleksi terkait menyarankan item yang belum ada di tas.

## Source

`src/lib/pages/storefront/cart/page.svelte`
