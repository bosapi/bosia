---
title: Pages — Auth OTP / 2FA
description: Layar dua faktor — input kode 6 digit bersegmen dan verifikasi.
demo: AuthOtpDemo
---

Layar dua faktor: badge perisai, [input OTP](/blocks/auth) 6 digit bersegmen dengan maju otomatis
dan tempel, pesan info, tombol verifikasi, dan tautan kirim ulang. Default ke tata letak terpusat;
set `variant="split"` untuk tampilan dua panel.

## Preview

## Install

```bash
bun x bosia@latest add page auth/otp
```

Menginstal `page.svelte` plus setiap block auth yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Otp from "$lib/pages/auth/otp/page.svelte";
</script>

<Otp />
<Otp variant="split" />
```

Kedua tata letak ditampilkan pada preview di atas; berikan `variant="split"` (atau ubah default-nya
di `page.svelte`) untuk memakai split dua panel.

Halaman ini memakai block `auth/otp-input`; [`ui/input-otp`](/components/ui/input-otp) adalah
alternatif primitif.

## Backend

Hanya visual — tanpa pembuatan atau verifikasi kode. Pasangkan dengan `bosia-auth-flow` untuk
rangkaian server.

## Source

`src/lib/pages/auth/otp/page.svelte`
