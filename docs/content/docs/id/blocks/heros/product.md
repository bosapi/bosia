---
title: Heros — Product
description: Hero peluncuran produk SaaS terpusat dengan penangkapan email dan mock browser.
demo: HeroProductDemo
---

```bash
bun x bosia@latest add block heros/product
```

Hero peluncuran produk SaaS terpusat dengan penangkapan email dan mock browser. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/product
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Product from "$lib/blocks/heros/product/block.svelte";
</script>

<Product />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/product/block.svelte`
