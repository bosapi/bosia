---
title: Section Logo
description: Section logo-cloud — baris trusted-by dan grid sel berbingkai berisi wordmark teks bergaya.
demo: LogosSectionsDemo
---

Section logo-cloud untuk halaman landing atau marketing. Masing-masing adalah Svelte `<section>`
mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di
setiap tema. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block logos/row
bun x bosia@latest add block logos/grid
```

## Blok-bloknya

- **`row`** — baris microcopy trusted-by di atas enam wordmark teks bergaya grayscale.
- **`grid`** — grid sel dua-kali-empat berbingkai berisi wordmark yang menggelap saat hover.

## Usage

```svelte
<script lang="ts">
	import Logos from "$lib/blocks/logos/row/block.svelte";
</script>

<Logos />
```

Wordmark dikirim sebagai teks bergaya fiktif (tanpa merek dagang asli) dalam array hardcoded —
ganti dengan nama pelanggan Anda, atau tukar `<span>` menjadi `<img>` jika Anda punya aset logo.

## Source

`src/lib/blocks/logos/*/block.svelte`
