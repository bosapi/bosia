---
title: Grape theme
description: Dark lilac/purple with a soft accent glow.
---

```bash
bun x bosia@latest add theme grape
```

Dark lilac/purple with a soft accent **glow**. Display in **Bricolage Grotesque**, body in **Plus Jakarta Sans**. A light variant is provided for `:root` so the Light/Dark toggle still works.

## Tokens

- `--radius: 0.875rem`
- Brand maps to `--primary` (lilac) — use `bg-primary` / `text-primary`
- Glow elevation: dark `shadow-lg` adds a soft `hsl(var(--primary))` halo
- `--font-mono: "JetBrains Mono"` for numerics
- Dark-native, with a light `:root` variant

Source: `registry/themes/grape/tokens.css`.
