---
title: Heros — Home Goods
description: Hero gaya hidup full-bleed dengan kartu produk unggulan mengambang.
demo: HeroHomeGoodsDemo
---

```bash
bun x bosia@latest add block heros/home-goods
```

Hero gaya hidup full-bleed dengan kartu produk unggulan mengambang. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/home-goods
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import HomeGoods from "$lib/blocks/heros/home-goods/block.svelte";
</script>

<HomeGoods />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/home-goods/block.svelte`
