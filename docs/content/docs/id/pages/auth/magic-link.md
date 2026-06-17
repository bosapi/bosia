---
title: Pages — Auth Magic Link
description: Layar konfirmasi setelah email tanpa kata sandi atau reset — periksa kotak masuk Anda.
demo: AuthMagicLinkDemo
---

Layar "kami mengirimi Anda tautan": badge surat, email tujuan, pesan sukses, tautan kirim ulang, dan
tombol kembali-ke-masuk. Mencakup alur magic-link maupun reset-terkirim. Default ke tata letak
terpusat; set `variant="split"` untuk tampilan dua panel.

## Preview

## Install

```bash
bun x bosia@latest add page auth/magic-link
```

Menginstal `page.svelte` plus setiap block auth yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import MagicLink from "$lib/pages/auth/magic-link/page.svelte";
</script>

<MagicLink />
<MagicLink variant="split" />
```

Kedua tata letak ditampilkan pada preview di atas; berikan `variant="split"` (atau ubah default-nya
di `page.svelte`) untuk memakai split dua panel.

## Backend

Hanya visual — tanpa pembuatan atau pengiriman tautan. Pasangkan dengan `bosia-auth-flow` untuk
rangkaian server.

## Source

`src/lib/pages/auth/magic-link/page.svelte`
