---
title: Heros — Bookstore
description: Hero toko buku dengan sampul berkipas dan kartu pilihan staf mengambang.
demo: HeroBookstoreDemo
---

```bash
bun x bosia@latest add block heros/bookstore
```

Hero toko buku dengan sampul berkipas dan kartu pilihan staf mengambang. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/bookstore
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Bookstore from "$lib/blocks/heros/bookstore/block.svelte";
</script>

<Bookstore />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/bookstore/block.svelte`
