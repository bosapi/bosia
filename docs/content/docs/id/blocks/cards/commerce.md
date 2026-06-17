---
title: Card — Commerce
description: Kartu produk, harga, pesanan, dan ulasan untuk e-commerce.
demo: CardsCommerceDemo
---

Kartu commerce untuk storefront dan alur checkout. Warna brand dipetakan ke `--primary`, sehingga
CTA, badge, dan border harga unggulan mengikuti tema yang aktif.

## Preview

## Install

Setiap kartu diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block cards/product
bun x bosia@latest add block cards/pricing
bun x bosia@latest add block cards/order
bun x bosia@latest add block cards/review
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Pricing from "$lib/blocks/cards/pricing/block.svelte";
</script>

<Pricing featured />
```

Kartu harga menerima prop `featured` (default `true`) yang mengalihkan border tersorot dan CTA
primary. Toggle suka dan tambah-ke-tas pada kartu produk hanyalah `$state` lokal kosmetik.
