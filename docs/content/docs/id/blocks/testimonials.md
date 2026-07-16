---
title: Section Testimoni
description: Section bukti sosial — grid kartu kutipan dan satu kutipan sorotan berukuran besar.
demo: TestimonialsSectionsDemo
---

Section bukti sosial untuk halaman landing atau marketing. Masing-masing adalah Svelte `<section>`
mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di
setiap tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block testimonials/grid
bun x bosia@latest add block testimonials/spotlight
```

Semuanya menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`grid`** — heading di atas kartu kutipan dengan rating bintang, avatar inisial, dan nama / peran.
- **`spotlight`** — satu pull-quote berukuran besar dengan avatar, nama / perusahaan, dan indikator titik.

## Usage

```svelte
<script lang="ts">
	import Testimonials from "$lib/blocks/testimonials/grid/block.svelte";
</script>

<Testimonials />
```

Kutipan dan nama berada di array hardcoded di bagian atas masing-masing `block.svelte` — tukar
dengan milik Anda. Bintang dan aksen memakai `primary` serta warna status, jadi setiap section
mengikuti tema yang aktif.

## Source

`src/lib/blocks/testimonials/*/block.svelte`
