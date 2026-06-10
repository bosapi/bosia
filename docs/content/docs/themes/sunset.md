---
title: Sunset theme
description: Warm orange + pink accent. Energetic consumer and marketing aesthetic.
---

```bash
bun x bosia@latest add theme sunset
```

Warm orange primary with a pink accent for energetic consumer apps, landing pages, and marketing sites. System font stack — zero web font cost.

## Tokens

- Vibrant orange primary: `20 95% 53%`
- Pink-340 accent for highlights and secondary CTAs
- `--radius: 0.625rem` (modern, slightly rounded)
- `--font-display` and `--font-body` both system-ui (no web fonts)
- HSL values so Tailwind opacity modifiers work: `bg-primary/80`, etc.

Source: `registry/themes/sunset/tokens.css`.
