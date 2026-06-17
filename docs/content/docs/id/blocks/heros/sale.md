---
title: Heros — Sale
description: Hero obral full-bleed dengan timer hitung mundur di atas foto yang digelapkan.
demo: HeroSaleDemo
---

```bash
bun x bosia@latest add block heros/sale
```

Hero obral full-bleed dengan timer hitung mundur di atas foto yang digelapkan. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/sale
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Sale from "$lib/blocks/heros/sale/block.svelte";
</script>

<Sale />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/sale/block.svelte`
