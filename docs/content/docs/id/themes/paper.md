---
title: Tema Paper
description: Netral cardstock hangat dengan brand ink-blue. Nuansa editorial bersih.
---

```bash
bun x bosia@latest add theme paper
```

Netral "cardstock" putih-pudar hangat dengan brand ink-blue yang percaya diri. Display dengan **Bricolage Grotesque**, body dengan **Plus Jakarta Sans** (keduanya dari Google Fonts), angka dengan **JetBrains Mono**. Diporting dari sistem desain Cardstock — permukaan default untuk kartu [Commerce](/docs/blocks/cards/commerce/) dan [Auth & Marketing](/docs/blocks/cards/auth/).

## Tokens

- `--radius: 0.75rem`
- Brand dipetakan ke `--primary` (ink blue) — gunakan `bg-primary` / `text-primary`
- Elevasi bernuansa-foreground lembut: `shadow-sm` / `shadow-md` / `shadow-lg`
- `--font-mono: "JetBrains Mono"` untuk angka dan kode
- Terang + gelap lewat `:root` / `.dark`

Sumber: `registry/themes/paper/tokens.css`.
