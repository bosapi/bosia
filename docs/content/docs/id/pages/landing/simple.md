---
title: Pages — Simple Landing
description: Halaman landing ramping yang disusun dari blok marketing — navbar minimal, hero, split features, testimoni sorotan, panel CTA, dan footer.
demo: PagesLandingSimpleDemo
---

Halaman landing ramping satu-produk untuk saat layout SaaS penuh terasa berlebihan: navbar minimal,
hero agency, split features berselang-seling, testimoni sorotan, panel CTA, dan footer minimal.
Setiap blok sadar-tema — coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add page landing/simple
```

Menginstal `page.svelte` plus setiap blok yang disusunnya. Beberapa blok itu menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Landing from "$lib/pages/landing/simple/page.svelte";
</script>

<Landing />
```

Halaman ini hanya komposisi — ia mengimpor setiap blok dan menumpuknya berurutan, tanpa props.
Sunting masing-masing blok di bawah `src/lib/blocks/` untuk mengubah teks, atau susun ulang / hapus
section di `page.svelte`. Untuk layout marketing penuh, lihat [SaaS landing](/pages/landing/saas).

## Source

`src/lib/pages/landing/simple/page.svelte`
