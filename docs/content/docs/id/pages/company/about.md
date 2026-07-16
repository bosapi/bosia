---
title: Halaman — Tentang
description: Halaman tentang yang dirangkai dari blok — navbar, hero, pita statistik, grid tim, panel CTA dan footer.
demo: PagesCompanyAboutDemo
---

Halaman about / perusahaan lengkap: navbar minimal, hero gaya konsultan, pita statistik, grid tim,
panel CTA penutup dan footer minimal. Setiap blok sadar-tema — coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add page company/about
```

Memasang `page.svelte` plus setiap blok yang dirangkainya. Beberapa blok menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Penggunaan

```svelte
<script lang="ts">
	import About from "$lib/pages/company/about/page.svelte";
</script>

<About />
```

Halaman ini murni komposisi — mengimpor tiap blok dan menumpuknya berurutan, tanpa props. Ubah
masing-masing blok di `src/lib/blocks/` untuk mengganti teks, atau susun ulang / hapus section di
`page.svelte`. Tambahkan `team/spotlight` di atas grid tim untuk menonjolkan founder, atau ganti
hero dengan blok `heros/*` lain.

## Sumber

`src/lib/pages/company/about/page.svelte`
