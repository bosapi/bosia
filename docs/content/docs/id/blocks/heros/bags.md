---
title: Heros — Bags
description: Hero produk premium gelap dengan callout spesifikasi dan badge edisi.
demo: HeroBagsDemo
---

```bash
bun x bosia@latest add block heros/bags
```

Hero produk premium gelap dengan callout spesifikasi dan badge edisi. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/bags
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Bags from "$lib/blocks/heros/bags/block.svelte";
</script>

<Bags />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/bags/block.svelte`
