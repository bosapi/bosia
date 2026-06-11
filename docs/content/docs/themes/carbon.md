---
title: Carbon theme
description: Brutalist mono — high contrast, hard offset shadows, orange brand.
---

```bash
bun x bosia@latest add theme carbon
```

Brutalist black-on-paper with a hot orange brand. Square corners (`--radius: 0`), heavy black borders, and **hard offset shadows** (no blur) for the stacked-paper look. Display and mono both **JetBrains Mono**, body **Plus Jakarta Sans**.

## Tokens

- `--radius: 0rem` — everything is square
- Brand maps to `--primary` (orange) — use `bg-primary` / `text-primary`
- Hard offset elevation: `shadow-md` renders as `4px 4px 0 0` ink, no blur
- Heavy borders via `--border` set to near-black (white in dark)
- Light + dark via `:root` / `.dark`

Source: `registry/themes/carbon/tokens.css`.
