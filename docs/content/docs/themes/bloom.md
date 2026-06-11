---
title: Bloom theme
description: Soft pastel pink, playful big radius, diffuse tinted shadows.
---

```bash
bun x bosia@latest add theme bloom
```

Soft, playful pastel pink with generous rounding and **diffuse, brand-tinted shadows**. Display in **Bricolage Grotesque**, body in **Plus Jakarta Sans**.

## Tokens

- Large `--radius: 1.25rem` — pillowy corners
- Brand maps to `--primary` (pink) — use `bg-primary` / `text-primary`
- Diffuse tinted elevation: `shadow-md` is a soft `hsl(var(--primary))` glow, not a hard drop
- `--font-mono: "JetBrains Mono"` for numerics
- Light + dark via `:root` / `.dark`

Source: `registry/themes/bloom/tokens.css`.
