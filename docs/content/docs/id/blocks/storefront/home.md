---
title: Storefront — Home Sections
description: Ubin kategori, baris nilai, banner dan strip promo, editorial, testimoni, dan newsletter.
demo: StorefrontHomeDemo
---

Bagian marketing yang menyusun halaman beranda storefront. Masing-masing adalah `<section>` mandiri
yang digerakkan prop dengan token semantik, sehingga gayanya berganti di setiap tema.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/category-tiles
bun x bosia@latest add block storefront/value-row
bun x bosia@latest add block storefront/promo-banner
bun x bosia@latest add block storefront/promo-strip
bun x bosia@latest add block storefront/editorial
bun x bosia@latest add block storefront/testimonials
bun x bosia@latest add block storefront/newsletter
```

Masing-masing menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import CategoryTiles from "$lib/blocks/storefront/category-tiles/block.svelte";
	import Editorial from "$lib/blocks/storefront/editorial/block.svelte";
</script>

<CategoryTiles categories={[{ name: "Home", image: "/home.jpg" }]} />
<Editorial flip />
```

Semua bagian menerima prop untuk teks dan konten dengan default yang masuk akal. `editorial` menerima
`flip` untuk menukar sisi gambar; `value-row` dan `testimonials` menerima array item; `newsletter`
menampilkan konfirmasi sebaris setelah submit.

## Source

`src/lib/blocks/storefront/{category-tiles,value-row,promo-banner,promo-strip,editorial,testimonials,newsletter}/block.svelte`
