---
title: Heros — Delivery
description: Hero pengantaran makanan dengan bilah pencarian alamat dan hidangan mengambang.
demo: HeroDeliveryDemo
---

```bash
bun x bosia@latest add block heros/delivery
```

Hero pengantaran makanan dengan bilah pencarian alamat dan hidangan mengambang. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/delivery
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Delivery from "$lib/blocks/heros/delivery/block.svelte";
</script>

<Delivery />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/delivery/block.svelte`
