---
title: Amber theme
description: Amber primary + yellow accent. Cozy hospitality and food aesthetic.
---

```bash
bun x bosia@latest add theme amber
```

Warm amber primary with a yellow accent and generous radius. Cozy palette for hospitality, food, and lifestyle apps that want a soft, friendly feel. System font stack — zero web font cost.

## Tokens

- Amber primary: `38 92% 50%`
- Yellow-45 accent for highlights and badges
- `--radius: 1rem` (soft, pillowy corners)
- `--font-display` and `--font-body` both system-ui (no web fonts)
- HSL values so Tailwind opacity modifiers work: `bg-primary/80`, etc.

Source: `registry/themes/amber/tokens.css`.
