---
title: Section Galeri
description: Section galeri — grid seragam dengan lightbox dialog dan masonry kolom CSS.
demo: GallerySectionsDemo
---

Section galeri gambar untuk situs portofolio, agensi, atau venue. Masing-masing adalah Svelte
`<section>` mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya
berganti di setiap tema. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block gallery/grid
bun x bosia@latest add block gallery/masonry
```

`grid` menarik [`ui/dialog`](/components/ui/dialog/) untuk lightbox-nya.

## Blok-bloknya

- **`grid`** — thumbnail persegi seragam; klik salah satu untuk membuka foto penuh dalam lightbox dialog.
- **`masonry`** — foto beragam tinggi mengalir dalam kolom CSS — tanpa JavaScript, tanpa library.

## Penggunaan

```svelte
<script lang="ts">
	import Gallery from "$lib/blocks/gallery/grid/block.svelte";
</script>

<Gallery />
```

Kedua blok membawa foto contoh sehingga langsung tampil. Untuk fotomu sendiri, kirim `images` —
array `{ src, alt }` (`grid` juga menerima `caption` opsional yang tampil di lightbox) — plus
`heading` dan `intro` untuk teksnya. Padukan dengan [feature `file-upload`](/guides/file-upload/)
jika gambarnya berasal dari penyimpananmu sendiri.

## Sumber

`src/lib/blocks/gallery/*/block.svelte`
