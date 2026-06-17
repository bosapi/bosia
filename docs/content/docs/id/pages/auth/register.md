---
title: Pages — Auth Register
description: Halaman daftar yang disusun dari block auth — grid sosial, nama/email/kata sandi, meter kekuatan.
demo: AuthRegisterDemo
---

Layar pembuatan akun: brand, grid sosial, field nama, email kerja, dan kata sandi dengan meter
[kekuatan kata sandi](/blocks/auth) langsung, catatan ketentuan, dan baris-alih masuk. Default ke
tata letak terpusat; set `variant="split"` untuk tampilan dua panel.

## Preview

## Install

```bash
bun x bosia@latest add page auth/register
```

Menginstal `page.svelte` plus setiap block auth yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Register from "$lib/pages/auth/register/page.svelte";
</script>

<Register />
<Register variant="split" />
```

Berikan prop `variant` (atau ubah default-nya di bagian atas `page.svelte`) untuk beralih antara
kartu terpusat dan split dua panel — keduanya ditampilkan pada preview di atas. Lihat
[ringkasan pages](/pages/overview).

## Backend

Hanya visual — tanpa pembuatan pengguna atau hashing. Pasangkan dengan `bosia-auth-flow` untuk
rangkaian server.

## Source

`src/lib/pages/auth/register/page.svelte`
