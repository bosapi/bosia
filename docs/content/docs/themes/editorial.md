---
title: Editorial theme
description: Warm cream palette with Instrument Serif display. Magazine feel for marketing and landing pages.
---

```bash
bun x bosia@latest add theme editorial
```

Cream background, ink foreground, terracotta accent. Display in **Instrument Serif** (loaded from Google Fonts), body in **Inter**. Pairs especially well with the [Commerce](/docs/blocks/cards/commerce/) and [Auth & Marketing](/docs/blocks/cards/auth/) cards.

## Tokens

- Larger `--radius: 0.75rem`
- `--font-display: "Instrument Serif"` — use via `font-display` Tailwind class
- `--font-body: "Inter"`
- Fonts auto-injected as `@import` lines into `src/app.css`

## Switching back

```bash
bun x bosia@latest add theme neutral
```

The CLI rewrites the theme import in `app.css`. Font imports stay (they're harmless and idempotent); remove manually if you care.

Source: `registry/themes/editorial/tokens.css`.
