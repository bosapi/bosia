---
title: Section FAQ
description: Section pertanyaan yang sering diajukan — akordeon details native dan grid dua kolom statis.
demo: FaqSectionsDemo
---

Section FAQ untuk halaman landing atau marketing. Masing-masing adalah Svelte `<section>` mandiri
selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap
tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block faq/accordion
bun x bosia@latest add block faq/grid
```

`accordion` menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon toggle-nya.

## Blok-bloknya

- **`accordion`** — heading sticky dan kartu dukungan di samping daftar yang dapat dibuka. Dibangun
  di atas elemen `<details>` / `<summary>` native, jadi tidak butuh JavaScript maupun komponen tambahan.
- **`grid`** — grid tanya-jawab dua kolom statis dengan pembatas tipis.

## Usage

```svelte
<script lang="ts">
	import Faq from "$lib/blocks/faq/accordion/block.svelte";
</script>

<Faq />
```

Pertanyaan dan jawaban berada di array hardcoded di bagian atas masing-masing `block.svelte`.
Akordeon memakai disclosure native, jadi state buka / tutup bekerja tanpa kode klien apa pun.

## Source

`src/lib/blocks/faq/*/block.svelte`
