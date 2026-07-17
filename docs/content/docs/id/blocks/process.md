---
title: Section Proses
description: Section proses — baris cara-kerja bernomor dan timeline milestone vertikal.
demo: ProcessSectionsDemo
---

Section "cara kerja" untuk situs jasa, agensi, atau produk. Masing-masing adalah Svelte
`<section>` mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya
berganti di setiap tema. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block process/steps
bun x bosia@latest add block process/timeline
```

## Blok-bloknya

- **`steps`** — heading terpusat di atas baris langkah bernomor horizontal, dengan garis
  penghubung di desktop.
- **`timeline`** — timeline milestone vertikal dengan label tahun — cocok untuk section "cerita
  kami" di halaman about.

## Penggunaan

```svelte
<script lang="ts">
	import Steps from "$lib/blocks/process/steps/block.svelte";
</script>

<Steps />
```

Kedua blok membawa teks contoh sehingga langsung tampil. Untuk teksmu sendiri, kirim `heading`,
`intro`, dan daftarnya: `steps` menerima `steps` (array `{ title, description }`), `timeline`
menerima `entries` (array `{ label, title, description }`).

## Sumber

`src/lib/blocks/process/*/block.svelte`
