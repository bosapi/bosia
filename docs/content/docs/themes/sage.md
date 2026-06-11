---
title: Sage theme
description: Calm muted green, small radius, quiet ambient shadows.
---

```bash
bun x bosia@latest add theme sage
```

Calm, muted sage green — quiet and content-friendly. Small radius, soft ambient shadows. Display in **Bricolage Grotesque**, body in **Plus Jakarta Sans**.

## Tokens

- Small `--radius: 0.625rem`
- Brand maps to `--primary` (muted green) — use `bg-primary` / `text-primary`
- Quiet foreground-tinted elevation: `shadow-sm` / `shadow-md` / `shadow-lg`
- `--font-mono: "JetBrains Mono"` for numerics
- Light + dark via `:root` / `.dark`

Source: `registry/themes/sage/tokens.css`.
