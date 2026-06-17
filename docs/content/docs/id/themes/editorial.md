---
title: Tema Editorial
description: Palet krem hangat dengan display Instrument Serif. Nuansa majalah untuk halaman marketing dan landing.
---

```bash
bun x bosia@latest add theme editorial
```

Latar krem, foreground tinta, aksen terracotta. Display dengan **Instrument Serif** (dimuat dari Google Fonts), body dengan **Inter**. Cocok terutama dengan kartu [Commerce](/docs/blocks/cards/commerce/) dan [Auth & Marketing](/docs/blocks/cards/auth/).

## Tokens

- `--radius: 0.75rem` yang lebih besar
- `--font-display: "Instrument Serif"` — gunakan lewat kelas Tailwind `font-display`
- `--font-body: "Inter"`
- Font otomatis disuntikkan sebagai baris `@import` ke `src/app.css`

## Kembali beralih

```bash
bun x bosia@latest add theme neutral
```

CLI menulis ulang import tema di `app.css`. Import font tetap ada (tidak berbahaya dan idempoten); hapus manual jika Anda peduli.

Sumber: `registry/themes/editorial/tokens.css`.
