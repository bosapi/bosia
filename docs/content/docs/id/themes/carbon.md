---
title: Tema Carbon
description: Mono brutalist — kontras tinggi, bayangan offset keras, brand oranye.
---

```bash
bun x bosia@latest add theme carbon
```

Brutalist hitam-di-atas-kertas dengan brand oranye menyala. Sudut persegi (`--radius: 0`), border hitam tebal, dan **bayangan offset keras** (tanpa blur) untuk tampilan kertas bertumpuk. Display dan mono keduanya **JetBrains Mono**, body **Plus Jakarta Sans**.

## Tokens

- `--radius: 0rem` — semuanya persegi
- Brand dipetakan ke `--primary` (oranye) — gunakan `bg-primary` / `text-primary`
- Elevasi offset keras: `shadow-md` dirender sebagai tinta `4px 4px 0 0`, tanpa blur
- Border tebal lewat `--border` yang diset mendekati hitam (putih di mode gelap)
- Terang + gelap lewat `:root` / `.dark`

Sumber: `registry/themes/carbon/tokens.css`.
