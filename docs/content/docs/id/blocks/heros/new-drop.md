---
title: Heros — New Drop
description: Hero produk rilisan baru fashion dengan pemilih ukuran dan harga.
demo: HeroNewDropDemo
---

```bash
bun x bosia@latest add block heros/new-drop
```

Hero produk rilisan baru fashion dengan pemilih ukuran dan harga. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/new-drop
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import NewDrop from "$lib/blocks/heros/new-drop/block.svelte";
</script>

<NewDrop />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/new-drop/block.svelte`
