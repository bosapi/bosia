---
title: Storefront — Layout
description: Header lengket dengan mega menu dan footer multi-kolom untuk storefront Mercato.
demo: StorefrontLayoutDemo
---

Kerangka untuk setiap halaman storefront. Keduanya dibangun hanya dari token semantik, sehingga
gayanya berganti di seluruh 19 tema — pasangkan dengan tema `clay` untuk tampilan Mercato asli.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/header
bun x bosia@latest add block storefront/footer
```

Header bergantung pada `storefront/store` untuk tipe keranjang bersama. Keduanya menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<Header {cart} nav={["New In", "Shop", "Collections", "Sale"]} />
<!-- page sections -->
<Footer />
```

`Header` menerima `nav`, `announcements`, dan `cart` bersama opsional (merangkai jumlah tas dan
tersimpan serta membuka drawer keranjang). Berikan `cartCount` / `favCount` langsung jika Anda tidak
memakai store. Mega menu terbuka saat hover di atas item nav kedua.

## Source

`src/lib/blocks/storefront/header/block.svelte` · `src/lib/blocks/storefront/footer/block.svelte`
