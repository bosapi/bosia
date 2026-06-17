---
title: Pages — Storefront Checkout
description: Checkout multi-langkah dengan ringkasan pesanan dan state konfirmasi.
demo: PagesCheckoutDemo
---

Checkout Mercato: header, form empat langkah (kontak, pengiriman, pengantaran, pembayaran), ringkasan
pesanan lengket, dan layar sukses pesanan-terkonfirmasi setelah menempatkan pesanan.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/checkout
```

Menginstal `page.svelte` plus block storefront yang disusunnya.

## Usage

```svelte
<script lang="ts">
	import Checkout from "$lib/pages/storefront/checkout/page.svelte";
</script>

<Checkout />
```

Tas diisi awal dari katalog sehingga ringkasan menjumlahkan sesuatu; pengiriman bereaksi terhadap
metode pengantaran yang dipilih, dan menempatkan pesanan menukar ke layar konfirmasi. Sambungkan
field form dan `onPlaceOrder` ke backend Anda.

## Source

`src/lib/pages/storefront/checkout/page.svelte`
