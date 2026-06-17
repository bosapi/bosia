---
title: Pages — Auth SSO
description: Layar single sign-on perusahaan — email kerja atau domain.
demo: AuthSsoDemo
---

Layar perusahaan: badge gedung, eyebrow "Enterprise", field email kerja / domain, tombol
continue-with-SSO, dan baris-alih gunakan-metode-lain. Default ke tata letak terpusat; set
`variant="split"` untuk tampilan dua panel.

## Preview

## Install

```bash
bun x bosia@latest add page auth/sso
```

Menginstal `page.svelte` plus setiap block auth yang disusunnya. Menarik
[`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Sso from "$lib/pages/auth/sso/page.svelte";
</script>

<Sso />
<Sso variant="split" />
```

Kedua tata letak ditampilkan pada preview di atas; berikan `variant="split"` (atau ubah default-nya
di `page.svelte`) untuk memakai split dua panel.

## Backend

Hanya visual — tanpa pengalihan ke penyedia identitas. Pasangkan dengan `bosia-auth-flow` untuk
rangkaian server.

## Source

`src/lib/pages/auth/sso/page.svelte`
