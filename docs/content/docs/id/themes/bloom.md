---
title: Tema Bloom
description: Pink pastel lembut, radius besar yang ceria, bayangan bernuansa difus.
---

```bash
bun x bosia@latest add theme bloom
```

Pink pastel lembut yang ceria dengan pembulatan lega dan **bayangan bernuansa brand yang difus**. Display dengan **Bricolage Grotesque**, body dengan **Plus Jakarta Sans**.

## Tokens

- `--radius: 1.25rem` yang besar — sudut empuk
- Brand dipetakan ke `--primary` (pink) — gunakan `bg-primary` / `text-primary`
- Elevasi bernuansa difus: `shadow-md` adalah kilau `hsl(var(--primary))` lembut, bukan drop keras
- `--font-mono: "JetBrains Mono"` untuk angka
- Terang + gelap lewat `:root` / `.dark`

Sumber: `registry/themes/bloom/tokens.css`.
