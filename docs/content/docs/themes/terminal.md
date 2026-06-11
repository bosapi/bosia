---
title: Terminal theme
description: Dark technical green phosphor, mono display, faint accent glow.
---

```bash
bun x bosia@latest add theme terminal
```

Dark, technical, green-phosphor-on-black. Display and mono both **JetBrains Mono**, body **Plus Jakarta Sans**. Tight `--radius` and a faint accent **glow** on raised surfaces. A light variant is provided for `:root` so the Light/Dark toggle still works.

## Tokens

- Tight `--radius: 0.3rem`
- Brand maps to `--primary` (phosphor green) — use `bg-primary` / `text-primary`
- Glow elevation: dark `shadow-lg` adds a soft `hsl(var(--primary))` halo
- Mono display via `--font-display` — headings render in JetBrains Mono
- Dark-native, with a light `:root` variant

Source: `registry/themes/terminal/tokens.css`.
