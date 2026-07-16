---
title: Section Harga
description: Section harga selebar penuh — layout kolom tiga tingkat, tabel perbandingan paket, dan toggle paket tunggal.
demo: PricingSectionsDemo
---

Section harga siap pakai untuk halaman landing atau marketing. Masing-masing adalah Svelte
`<section>` mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya
berganti di setiap tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block pricing/columns
bun x bosia@latest add block pricing/comparison
bun x bosia@latest add block pricing/simple
```

Semuanya menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`columns`** — tiga kartu tingkat dengan paket "Paling populer" yang terangkat, checklist fitur, dan CTA.
- **`comparison`** — tabel berkolom-paket dengan header harga serta baris check / minus / nilai.
- **`simple`** — satu paket terpusat dengan toggle bulanan / tahunan, checklist dua kolom, dan CTA lebar.

## Usage

```svelte
<script lang="ts">
	import Pricing from "$lib/blocks/pricing/columns/block.svelte";
</script>

<Pricing />
```

Konten berada di array hardcoded di bagian atas masing-masing `block.svelte` — sunting tingkat,
harga, dan fitur agar sesuai produk Anda. Tingkat unggulan dan setiap aksen memakai `primary`,
jadi section mengikuti tema mana pun yang aktif.

## Source

`src/lib/blocks/pricing/*/block.svelte`
