---
title: Storefront — Layout
description: Header lengket dengan mega menu, overlay pencarian command-palette, dan footer multi-kolom.
demo: StorefrontLayoutDemo
---

Kerangka untuk setiap halaman storefront, plus overlay pencarian yang dibuka ikon cari di header.
Semuanya dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 19 tema —
pasangkan dengan tema `clay` untuk tampilan Mercato asli.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/header
bun x bosia@latest add block storefront/footer
bun x bosia@latest add block storefront/search-overlay
bun x bosia@latest add block storefront/mega-menu
```

Header dan overlay pencarian bergantung pada `storefront/store`. Semuanya menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import SearchOverlay from "$lib/blocks/storefront/search-overlay/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
	let searchOpen = $state(false);
</script>

<Header
	{cart}
	nav={["New In", "Shop", "Collections", "Sale"]}
	onSearch={() => (searchOpen = true)}
/>
<!-- page sections -->
<Footer />
<SearchOverlay bind:open={searchOpen} />
```

`Header` menerima `nav`, `announcements`, `cart` bersama opsional (merangkai jumlah tas dan
tersimpan serta membuka drawer keranjang), dan callback `onSearch` untuk ikon cari. Berikan
`cartCount` / `favCount` langsung jika Anda tidak memakai store. Mega menu terbuka saat hover di
atas item nav kedua.

`search-overlay` mem-bind `open`, melengkapi otomatis dari `products`-nya (nama dan kategori)
dengan navigasi keyboard penuh, menampilkan chip `popular` saat kueri kosong, dan memanggil
`onSelect(product)` atau `onSubmit(query)` untuk pencarian teks bebas.

Header menyertakan mega menu hover bawaan; `mega-menu` adalah versi mandiri yang dapat diatur
untuk header kustom — kirim `sections` (`{ title, links }`), produk `featured` untuk kolom sorotan,
dan kendalikan tampilannya dengan `open` (default terbuka agar tampil mandiri).

## Source

`src/lib/blocks/storefront/{header,footer,search-overlay,mega-menu}/block.svelte`
