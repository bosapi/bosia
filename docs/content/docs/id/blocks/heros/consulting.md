---
title: Heros — Consulting
description: Hero terbagi konsultasi B2B dengan poin-poin dan statistik hasil.
demo: HeroConsultingDemo
---

```bash
bun x bosia@latest add block heros/consulting
```

Hero terbagi konsultasi B2B dengan poin-poin dan statistik hasil. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/consulting
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Consulting from "$lib/blocks/heros/consulting/block.svelte";
</script>

<Consulting />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/consulting/block.svelte`
