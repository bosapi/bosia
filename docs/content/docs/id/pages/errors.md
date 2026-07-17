---
title: Halaman — Error
description: Halaman 404, 500, dan maintenance mandiri — tanpa blok, tanpa dependensi, satu file per halaman.
demo: PagesErrorsDemo
---

Tiga layar error mandiri: 404, 500, dan halaman maintenance. Berbeda dari halaman lain, ketiganya
tidak menyusun blok apa pun — masing-masing adalah satu `page.svelte` mandiri tanpa dependensi,
sehingga tetap bekerja bahkan saat bagian lain aplikasimu sedang bermasalah.

## Preview

## Install

```bash
bun x bosia@latest add page errors/not-found
bun x bosia@latest add page errors/server-error
bun x bosia@latest add page errors/maintenance
```

## Halaman-halamannya

- **`not-found`** — 404 besar, pesan singkat, tautan kembali ke beranda. Sambungkan ke route
  error-mu untuk status 404.
- **`server-error`** — 500 dengan tombol muat ulang dan tautan beranda.
- **`maintenance`** — layar "kami segera kembali"; kirim `contactEmail` untuk menampilkan baris
  kontak darurat.

## Penggunaan

```svelte
<script lang="ts">
	import NotFound from "$lib/pages/errors/not-found/page.svelte";
</script>

<NotFound />
```

Semua teks bisa diganti lewat props (`code`, `title`, `message`, `homeHref`, `homeLabel`). Di
aplikasi Bosia, render `not-found` / `server-error` dari error boundary berdasarkan status, dan
sajikan `maintenance` dari route catch-all saat kamu sedang deploy.

## Sumber

`src/lib/pages/errors/*/page.svelte`
