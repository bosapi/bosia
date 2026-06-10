---
title: Mono theme
description: Brutalist monochrome. Sharp corners, monospace stack, agency / portfolio aesthetic.
---

```bash
bun x bosia@latest add theme mono
```

Brutalist monochrome — pure black on white, zero radius, monospace stack — for portfolios, agencies, and editorial sites that want the type to do the work.

## Tokens

- Near-black primary: `0 0% 9%` light / `0 0% 96%` dark
- Pure grayscale neutrals
- `--radius: 0rem` (sharp corners everywhere)
- `--font-display` and `--font-body` both `ui-monospace` stack (no web fonts)
- HSL values so Tailwind opacity modifiers work: `bg-primary/80`, etc.

Source: `registry/themes/mono/tokens.css`.
