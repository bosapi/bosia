---
title: Heros — Campus
description: Hero kampus full-bleed terpusat dengan statistik penerimaan.
demo: HeroCampusDemo
---

```bash
bun x bosia@latest add block heros/campus
```

Hero kampus full-bleed terpusat dengan statistik penerimaan. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/campus
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Campus from "$lib/blocks/heros/campus/block.svelte";
</script>

<Campus />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/campus/block.svelte`
