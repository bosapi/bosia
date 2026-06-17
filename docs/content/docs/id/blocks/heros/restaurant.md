---
title: Heros — Restaurant
description: Hero restoran full-bleed dengan CTA reservasi dan meta tempat.
demo: HeroRestaurantDemo
---

```bash
bun x bosia@latest add block heros/restaurant
```

Hero restoran full-bleed dengan CTA reservasi dan meta tempat. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/restaurant
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Restaurant from "$lib/blocks/heros/restaurant/block.svelte";
</script>

<Restaurant />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/restaurant/block.svelte`
