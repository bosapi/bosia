---
title: Tema Midnight
description: Primary indigo, dark-first. Estetika dashboard pro dan analitik.
---

```bash
bun x bosia@latest add theme midnight
```

Palet indigo yang disetel untuk dashboard gelap, alat analitik, dan konsol ops. Menyertakan varian terang yang bersih juga sehingga toggle terang/gelap tetap terasa kohesif. Tumpukan font sistem — tanpa biaya web font.

## Tokens

- Primary indigo: `234 80% 55%` terang / `234 80% 65%` gelap
- Netral bernuansa indigo sejuk di kedua mode
- `--radius: 0.5rem` (lebih rapat, ramah dashboard)
- `--font-display` dan `--font-body` keduanya system-ui (tanpa web font)
- Nilai HSL agar modifier opasitas Tailwind berfungsi: `bg-primary/80`, dll.

Sumber: `registry/themes/midnight/tokens.css`.
