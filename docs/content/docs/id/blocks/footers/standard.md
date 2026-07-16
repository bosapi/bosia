---
title: Footer — Standar
description: Layout footer terang klasik — minimal, columns, newsletter, centered, mega, dan split-brand.
demo: FootersStandardDemo
---

Footer situs sehari-hari. Masing-masing adalah Svelte `<footer>` mandiri selebar penuh yang
dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap tema — warna brand
dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

Setiap footer diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block footers/minimal
bun x bosia@latest add block footers/columns
bun x bosia@latest add block footers/newsletter
bun x bosia@latest add block footers/centered
bun x bosia@latest add block footers/mega
bun x bosia@latest add block footers/split-brand
```

Sebagian menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`minimal`** — satu baris: wordmark di kiri, tautan inline di tengah, hak cipta di kanan; menumpuk di mobile.
- **`columns`** — empat kolom: kolom brand dengan blurb dan sosial plus tiga kolom tautan.
- **`newsletter`** — pita penjaring email di atas kolom tautan dan baris legal.
- **`centered`** — glif bertumpuk di tengah, tagline, baris tautan, dan tombol sosial bulat.
- **`mega`** — lima kolom tautan, satu kolom kontak, serta pilihan bahasa / mata uang.
- **`split-brand`** — wordmark berukuran besar dan sepasang CTA di kiri, tautan ringkas di kanan, strip legal.

## Usage

```svelte
<script lang="ts">
	import Columns from "$lib/blocks/footers/columns/block.svelte";
</script>

<Columns />
```

Wordmark dikirim sebagai placeholder literal `__BRAND__` — `bun run check` gagal sampai Anda
menggantinya dengan brand sendiri, jadi scaffold baru tidak pernah membawa nama orang lain. Tautan
sosial memakai glif SVG inline (Lucide v1 tidak lagi menyertakan ikon brand); sunting `block.svelte`
untuk mengarahkannya ke profil Anda.

## Source

`src/lib/blocks/footers/*/block.svelte`
