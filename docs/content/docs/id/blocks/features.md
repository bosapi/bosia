---
title: Section Fitur
description: Section fitur — grid ubin ikon, baris split berselang-seling, dan grid bento campuran.
demo: FeaturesSectionsDemo
---

Section fitur untuk halaman landing atau marketing. Masing-masing adalah Svelte `<section>` mandiri
selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap
tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block features/grid
bun x bosia@latest add block features/split
bun x bosia@latest add block features/bento
```

Semuanya menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`grid`** — heading di atas grid tiga-kali-dua berisi ubin fitur berikon.
- **`split`** — baris teks-dan-visual berselang-seling dengan kicker, checklist, dan panel tiruan.
- **`bento`** — satu ubin besar plus empat ubin kecil yang memadukan ikon, sebuah statistik, dan mini-visual.

## Usage

```svelte
<script lang="ts">
	import Features from "$lib/blocks/features/grid/block.svelte";
</script>

<Features />
```

Teks fitur dan ikon berada di array hardcoded di bagian atas masing-masing `block.svelte`. Impor
ikon lucide dengan nama persisnya lalu tukar — setiap aksen ikon memakai `primary`.

## Source

`src/lib/blocks/features/*/block.svelte`
