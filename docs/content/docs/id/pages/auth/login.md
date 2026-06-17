---
title: Pages — Auth Login
description: Halaman masuk yang disusun dari block auth — baris sosial, email + kata sandi, ingat saya.
demo: AuthLoginDemo
---

Layar masuk: brand, baris sosial, pembatas, field email dan kata sandi, ingat saya, dan baris-alih
buat-akun. Default ke tata letak terpusat; set `variant="split"` untuk tampilan dua panel.

## Preview

## Install

```bash
bun x bosia@latest add page auth/login
```

Menginstal `page.svelte` plus setiap block auth yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Login from "$lib/pages/auth/login/page.svelte";
</script>

<Login />
<Login variant="split" />
```

Berikan prop `variant` (atau ubah default-nya di bagian atas `page.svelte`) untuk beralih antara
kartu terpusat dan split dua panel — keduanya ditampilkan pada preview di atas. Lihat
[ringkasan pages](/pages/overview) untuk keluarga auth.

## Backend

Hanya visual — tanpa sesi atau hashing kata sandi. Pasangkan dengan `bosia-auth-flow` untuk
rangkaian server.

## Source

`src/lib/pages/auth/login/page.svelte`
