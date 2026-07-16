---
title: Pages — SaaS Landing
description: Halaman landing SaaS lengkap yang disusun dari blok marketing — navbar, hero, logos, features, stats, pricing, testimonials, FAQ, CTA, dan footer.
demo: PagesLandingSaasDemo
---

Halaman landing SaaS lengkap, disusun dari ujung ke ujung dari blok registry: navbar klasik, hero
app, logo cloud, grid fitur, pita statistik, tabel harga tiga tingkat, grid testimoni, akordeon FAQ,
CTA penutup, dan footer empat kolom. Setiap blok sadar-tema — coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add page landing/saas
```

Menginstal `page.svelte` plus setiap blok yang disusunnya. Beberapa blok itu menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Landing from "$lib/pages/landing/saas/page.svelte";
</script>

<Landing />
```

Halaman ini hanya komposisi — ia mengimpor setiap blok dan menumpuknya berurutan, tanpa props.
Sunting masing-masing blok di bawah `src/lib/blocks/` untuk mengubah teks, atau susun ulang / hapus
section di `page.svelte`. Tukar impor `navbars/classic` dengan navbar lain, atau `footers/columns`
dengan footer lain, untuk mengubah gaya bingkainya.

## Source

`src/lib/pages/landing/saas/page.svelte`
