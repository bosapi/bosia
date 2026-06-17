---
title: Storefront — Listing
description: Sidebar filter dan bilah urut untuk halaman daftar produk.
demo: StorefrontListingDemo
---

Kontrol untuk halaman daftar kategori / produk (PLP). Gabungkan dengan `product-grid` untuk membangun
daftar lengkap — lihat [halaman listing](/pages/storefront/listing).

## Preview

## Install

```bash
bun x bosia@latest add block storefront/filter-sidebar
bun x bosia@latest add block storefront/sort-bar
```

`sort-bar` menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import SortBar from "$lib/blocks/storefront/sort-bar/block.svelte";
	import FilterSidebar from "$lib/blocks/storefront/filter-sidebar/block.svelte";

	let sort = $state("Featured");
</script>

<SortBar title="All products" count={24} bind:sort />
<FilterSidebar categories={["Home", "Kitchen", "Pantry"]} />
```

`sort-bar` mengekspos `sort` yang dapat di-bind sehingga induk dapat mengurutkan ulang grid-nya.
`filter-sidebar` menyimpan pilihannya di state lokal — baca atau angkat ke atas sesuai kebutuhan.

## Source

`src/lib/blocks/storefront/filter-sidebar/block.svelte` · `src/lib/blocks/storefront/sort-bar/block.svelte`
