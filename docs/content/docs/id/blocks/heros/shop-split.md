---
title: Heros — Shop Split
description: Hero produk terbagi dengan teks, harga, rating, dan badge pengiriman mengambang.
demo: HeroShopSplitDemo
---

```bash
bun x bosia@latest add block heros/shop-split
```

Hero produk terbagi dengan teks, harga, rating, dan badge pengiriman mengambang. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/shop-split
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import ShopSplit from "$lib/blocks/heros/shop-split/block.svelte";
</script>

<ShopSplit />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/shop-split/block.svelte`
