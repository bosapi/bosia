---
title: Clay theme
description: Warm paper neutrals with a terracotta brand and soft, warm-tinted shadows.
---

```bash
bun x bosia@latest add theme clay
```

Warm paper neutrals with a confident **terracotta** brand and soft, warm-tinted shadows. Display in **Newsreader** (serif), body in **Hanken Grotesk**, fine print in **Geist Mono** (all from Google Fonts). The home base for the [Mercato storefront](/pages/overview) — pair it with the `clay` purpose.

## Tokens

- Warm paper background, brown ink foreground
- Terracotta brand maps to `--primary` — use `bg-primary` / `text-primary`
- `--radius: 0.625rem` (restrained)
- Soft, warm foreground-tinted elevation: `shadow-sm` … `shadow-xl`
- `--font-display: "Newsreader"`, `--font-body: "Hanken Grotesk"`, `--font-mono: "Geist Mono"`
- Light + dark via `:root` / `.dark`

Source: `registry/themes/clay/tokens.css`.
