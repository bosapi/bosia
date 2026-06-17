---
title: Pages — Auth Forgot Password
description: Halaman pemulihan kata sandi — field email, catatan tautan reset, kembali ke masuk.
demo: AuthForgotDemo
---

Layar pemulihan: eyebrow "Account recovery", field email, pesan info tentang tautan reset sekali
pakai, dan baris-alih kembali-ke-masuk. Default ke tata letak terpusat; set `variant="split"` untuk
tampilan dua panel.

## Preview

## Install

```bash
bun x bosia@latest add page auth/forgot
```

Menginstal `page.svelte` plus setiap block auth yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Forgot from "$lib/pages/auth/forgot/page.svelte";
</script>

<Forgot />
<Forgot variant="split" />
```

Kedua tata letak ditampilkan pada preview di atas; berikan `variant="split"` (atau ubah default-nya
di `page.svelte`) untuk memakai split dua panel.

## Backend

Hanya visual — tanpa pencetakan token atau email. Pasangkan dengan `bosia-auth-flow` untuk rangkaian
server.

## Source

`src/lib/pages/auth/forgot/page.svelte`
