---
title: Heros — Toys
description: Hero mainan anak yang ceria dengan filter usia dan grid ubin kategori.
demo: HeroToysDemo
---

```bash
bun x bosia@latest add block heros/toys
```

Hero mainan anak yang ceria dengan filter usia dan grid ubin kategori. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/toys
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Toys from "$lib/blocks/heros/toys/block.svelte";
</script>

<Toys />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/toys/block.svelte`
