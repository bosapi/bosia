---
title: Tema Neutral
description: Palet default terinspirasi shadcn dengan mode terang + gelap dan tumpukan font sistem. Disertakan dengan proyek baru.
---

```bash
bun x bosia@latest add theme neutral
```

Tema default. Hitam-di-atas-putih di mode terang, latar mendekati hitam di mode gelap (dialihkan lewat `.dark` pada dokumen). Tumpukan font sistem untuk body dan display. Tanpa web font — biaya jaringan nol.

## Tokens

- Warna lewat custom property HSL agar modifier opasitas Tailwind (`bg-primary/80`) berfungsi
- `--radius: 0.5rem`
- `--font-display` dan `--font-body` keduanya system-ui

Sumber: `registry/themes/neutral/tokens.css`.
