---
title: Midnight theme
description: Indigo primary, dark-first. Pro dashboard and analytics aesthetic.
---

```bash
bun x bosia@latest add theme midnight
```

Indigo palette tuned for dark dashboards, analytics tools, and ops consoles. Ships a clean light variant too so light/dark toggles still feel cohesive. System font stack — zero web font cost.

## Tokens

- Indigo primary: `234 80% 55%` light / `234 80% 65%` dark
- Cool indigo-tinted neutrals across both modes
- `--radius: 0.5rem` (tighter, dashboard-friendly)
- `--font-display` and `--font-body` both system-ui (no web fonts)
- HSL values so Tailwind opacity modifiers work: `bg-primary/80`, etc.

Source: `registry/themes/midnight/tokens.css`.
