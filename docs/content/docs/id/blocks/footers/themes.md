---
title: Footer — Tema
description: Varian footer bergaya — dark, glass, gradient CTA, brutalist, editorial, dan terminal.
demo: FootersThemesDemo
---

Footer dengan perlakuan visual yang lebih kuat. Masing-masing adalah Svelte `<footer>` mandiri
selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap
tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

Setiap footer diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block footers/dark
bun x bosia@latest add block footers/glass
bun x bosia@latest add block footers/gradient
bun x bosia@latest add block footers/brutalist
bun x bosia@latest add block footers/editorial
bun x bosia@latest add block footers/terminal
```

## Blok-bloknya

- **`dark`** — footer multi-kolom solid di atas warna foreground dengan teks terbalik dan sosial.
- **`glass`** — panel buram berblur mengambang di atas pita muted dengan glow primary lembut.
- **`gradient`** — pita gradien gelap dengan glow primary di belakang headline CTA besar yang terpusat.
- **`brutalist`** — pita brand primary dengan border tebal, sel tautan mono berkotak, dan cap hak cipta.
- **`editorial`** — wordmark serif berukuran besar, garis tipis, dan baris tautan kapital kecil.
- **`terminal`** — teks mono di atas foreground dengan tautan berawalan prompt dan kursor berkedip.

## Usage

```svelte
<script lang="ts">
	import Dark from "$lib/blocks/footers/dark/block.svelte";
</script>

<Dark />
```

Wordmark dikirim sebagai placeholder literal `__BRAND__` — `bun run check` gagal sampai Anda
menggantinya dengan brand sendiri. Aksen brand selalu `primary`, jadi setiap footer mengikuti tema
mana pun yang aktif. Sunting `block.svelte` untuk mengganti wordmark dan teks.

## Source

`src/lib/blocks/footers/*/block.svelte`
