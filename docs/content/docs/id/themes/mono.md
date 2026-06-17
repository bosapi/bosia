---
title: Tema Mono
description: Monokrom brutalist. Sudut tajam, tumpukan monospace, estetika agensi / portofolio.
---

```bash
bun x bosia@latest add theme mono
```

Monokrom brutalist — hitam murni di atas putih, radius nol, tumpukan monospace — untuk portofolio, agensi, dan situs editorial yang ingin tipografi yang bekerja.

## Tokens

- Primary mendekati hitam: `0 0% 9%` terang / `0 0% 96%` gelap
- Netral grayscale murni
- `--radius: 0rem` (sudut tajam di mana-mana)
- `--font-display` dan `--font-body` keduanya tumpukan `ui-monospace` (tanpa web font)
- Nilai HSL agar modifier opasitas Tailwind berfungsi: `bg-primary/80`, dll.

Sumber: `registry/themes/mono/tokens.css`.
