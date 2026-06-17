---
title: Blok Auth
description: UI auth bersama — brand, shell, card, baris sosial, pembatas, field, kekuatan kata sandi, OTP dan pesan form.
demo: AuthBlocksDemo
---

Blok penyusun yang dapat dipakai ulang di balik [halaman auth](/pages/overview). Masing-masing
mandiri, digerakkan prop, dan hanya memakai token semantik, sehingga gayanya menyesuaikan di setiap
tema. Susun sendiri, atau instal satu [halaman auth](/pages/overview) utuh yang merangkainya.

## Preview

## Install

```bash
bun x bosia@latest add block auth/auth-shell
bun x bosia@latest add block auth/auth-card
bun x bosia@latest add block auth/brand
bun x bosia@latest add block auth/social-row
bun x bosia@latest add block auth/divider
bun x bosia@latest add block auth/auth-field
bun x bosia@latest add block auth/password-strength
bun x bosia@latest add block auth/otp-input
bun x bosia@latest add block auth/form-message
```

Beberapa di antaranya menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`auth-shell`** — kerangka tata letak; `variant="centered"` (kartu di halaman) atau `variant="split"`
  (panel brand/foto di samping kolom form).
- **`auth-card`** — wadah kartu dengan brand, ikon badge opsional, eyebrow, heading tampilan, lede,
  konten, dan footer baris-alih yang terpusat.
- **`brand`** — logomark + wordmark sebaris; `tone="inherit"` menyesuaikannya ke panel berwarna.
- **`social-row`** — tombol Google / Apple / GitHub / Microsoft dengan logo brand tersemat; bertumpuk
  atau `grid` 3-kolom yang ringkas.
- **`divider`** — garis tipis dengan label terpusat (default "or").
- **`auth-field`** — input berlabel dengan `icon` lucide di awal, toggle tampil/sembunyi kata sandi,
  dan teks bantuan/galat.
- **`password-strength`** — meter kekuatan tiga segmen dengan label.
- **`otp-input`** — input kode 6 digit bersegmen dengan maju otomatis, backspace, dan tempel.
- **`form-message`** — baris alert sukses / galat / info dengan ikon yang sesuai.

## Usage

```svelte
<script lang="ts">
	import { Mail, Lock } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";
</script>

<AuthShell variant="centered">
	<AuthCard title="Welcome back" lede="Sign in to pick up where you left off.">
		<AuthField name="email" label="Email" type="email" icon={Mail} placeholder="you@company.com" />
		<AuthField name="password" type="password" icon={Lock} placeholder="••••••••" />
	</AuthCard>
</AuthShell>
```

Aksi brand selalu `primary` (tidak pernah `accent`); meter kata sandi memakai warna status
(destructive / amber / emerald), bukan warna brand.

## Backend

Ini hanya lapisan visual — tanpa sesi, hashing, atau server action. Pasangkan dengan rangkaian
[`bosia-auth-flow`](/guides/security) untuk autentikasi sungguhan.

## Source

`src/lib/blocks/auth/*/block.svelte`
