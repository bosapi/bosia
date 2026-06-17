---
title: Heros — Apparel
description: Hero pakaian dengan swatch warna dan pemilih ukuran di samping model.
demo: HeroApparelDemo
---

```bash
bun x bosia@latest add block heros/apparel
```

Hero pakaian dengan swatch warna dan pemilih ukuran di samping model. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/apparel
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Apparel from "$lib/blocks/heros/apparel/block.svelte";
</script>

<Apparel />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/apparel/block.svelte`
