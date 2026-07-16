---
title: Section Statistik
description: Section metrik — pita angka ramping dan baris kartu statistik dengan chip delta.
demo: StatsSectionsDemo
---

Section metrik untuk halaman landing atau marketing. Masing-masing adalah Svelte `<section>`
mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di
setiap tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block stats/band
bun x bosia@latest add block stats/cards
```

`cards` menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikonnya.

## Blok-bloknya

- **`band`** — pita muted ramping berisi empat angka berukuran besar dengan pemisah tipis.
- **`cards`** — empat kartu statistik, masing-masing dengan ikon, nilai, label, dan chip delta primary.

## Usage

```svelte
<script lang="ts">
	import Stats from "$lib/blocks/stats/band/block.svelte";
</script>

<Stats />
```

Angka dan label berada di array hardcoded di bagian atas masing-masing `block.svelte` — tukar
dengan metrik Anda sendiri.

## Source

`src/lib/blocks/stats/*/block.svelte`
