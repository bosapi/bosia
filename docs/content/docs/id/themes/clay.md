---
title: Tema Clay
description: Netral kertas hangat dengan brand terracotta dan bayangan bernuansa hangat lembut.
---

```bash
bun x bosia@latest add theme clay
```

Netral kertas hangat dengan brand **terracotta** yang percaya diri dan bayangan bernuansa hangat lembut. Display dengan **Newsreader** (serif), body dengan **Hanken Grotesk**, cetakan halus dengan **Geist Mono** (semua dari Google Fonts). Basis utama untuk [storefront Mercato](/pages/overview) — pasangkan dengan purpose `clay`.

## Tokens

- Latar kertas hangat, foreground tinta cokelat
- Brand terracotta dipetakan ke `--primary` — gunakan `bg-primary` / `text-primary`
- `--radius: 0.625rem` (terkendali)
- Elevasi bernuansa-foreground hangat lembut: `shadow-sm` … `shadow-xl`
- `--font-display: "Newsreader"`, `--font-body: "Hanken Grotesk"`, `--font-mono: "Geist Mono"`
- Terang + gelap lewat `:root` / `.dark`

Sumber: `registry/themes/clay/tokens.css`.
