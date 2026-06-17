---
title: Heros — Lookbook
description: Hero lookbook fashion editorial di atas foto full-bleed.
demo: HeroLookbookDemo
---

```bash
bun x bosia@latest add block heros/lookbook
```

Hero lookbook fashion editorial di atas foto full-bleed. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/lookbook
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Lookbook from "$lib/blocks/heros/lookbook/block.svelte";
</script>

<Lookbook />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/lookbook/block.svelte`
