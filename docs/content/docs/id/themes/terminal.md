---
title: Tema Terminal
description: Fosfor hijau teknis gelap, display mono, kilau aksen samar.
---

```bash
bun x bosia@latest add theme terminal
```

Gelap, teknis, fosfor-hijau-di-atas-hitam. Display dan mono keduanya **JetBrains Mono**, body **Plus Jakarta Sans**. `--radius` rapat dan **kilau** aksen samar pada permukaan terangkat. Varian terang disediakan untuk `:root` sehingga toggle Terang/Gelap tetap berfungsi.

## Tokens

- `--radius: 0.3rem` yang rapat
- Brand dipetakan ke `--primary` (hijau fosfor) — gunakan `bg-primary` / `text-primary`
- Elevasi kilau: `shadow-lg` gelap menambahkan halo `hsl(var(--primary))` lembut
- Display mono lewat `--font-display` — heading dirender dengan JetBrains Mono
- Dark-native, dengan varian `:root` terang

Sumber: `registry/themes/terminal/tokens.css`.
