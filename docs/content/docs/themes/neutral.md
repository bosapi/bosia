---
title: Neutral theme
description: Default shadcn-inspired palette with light + dark modes and a system font stack. Ships with new projects.
---

```bash
bun x bosia@latest add theme neutral
```

The default theme. Black-on-white in light mode, near-black background in dark mode (toggled via `.dark` on the document). System font stack for body and display. No web fonts — zero network cost.

## Tokens

- Colors via HSL custom properties so Tailwind opacity modifiers (`bg-primary/80`) work
- `--radius: 0.5rem`
- `--font-display` and `--font-body` both system-ui

Source: `registry/themes/neutral/tokens.css`.
