---
title: Paper theme
description: Warm cardstock neutrals with an ink-blue brand. Clean editorial feel.
---

```bash
bun x bosia@latest add theme paper
```

Warm off-white "cardstock" neutrals with a confident ink-blue brand. Display in **Bricolage Grotesque**, body in **Plus Jakarta Sans** (both from Google Fonts), numerics in **JetBrains Mono**. Ported from the Cardstock design system — the default surface for the [card blocks](/docs/blocks/cards/).

## Tokens

- `--radius: 0.75rem`
- Brand maps to `--primary` (ink blue) — use `bg-primary` / `text-primary`
- Soft foreground-tinted elevation: `shadow-sm` / `shadow-md` / `shadow-lg`
- `--font-mono: "JetBrains Mono"` for numerics and code
- Light + dark via `:root` / `.dark`

Source: `registry/themes/paper/tokens.css`.
