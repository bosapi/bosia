---
title: Halaman — Kontak
description: Halaman kontak yang dirangkai dari blok — navbar minimal, form kontak split dengan detail, footer minimal.
demo: PagesCompanyContactDemo
---

Halaman kontak lengkap: navbar minimal, section kontak split (form di samping detail email /
telepon / kantor) dan footer minimal. Setiap blok sadar-tema — coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add page company/contact
```

Memasang `page.svelte` plus setiap blok yang dirangkainya. Blok kontak menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Penggunaan

```svelte
<script lang="ts">
	import Contact from "$lib/pages/company/contact/page.svelte";
</script>

<Contact />
```

Halaman ini murni komposisi — mengimpor tiap blok dan menumpuknya berurutan, tanpa props. Form
mengirim ke `/api/contact`; pasang [feature `contact-form`](/guides/contact-form/) untuk
backend-nya, atau arahkan prop `action` blok ke endpoint milikmu. Ganti `contact/split` dengan
`contact/simple` di `page.svelte` untuk layout terpusat.

## Sumber

`src/lib/pages/company/contact/page.svelte`
