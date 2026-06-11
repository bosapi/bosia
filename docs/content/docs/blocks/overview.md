---
title: Blocks
description: Composed UI sections (hero, pricing, cards) that bake good design into your app — install one command, no props to wire up.
---

## What blocks are

Primitives (`Button`, `Card`, `Input`) are unstyled toolkit pieces. They give you flexibility but no opinion. **Blocks** are the missing layer on top — composed sections with hardcoded copy, layout, and typography rhythm. Drop one in, then edit the copy in place.

Blocks follow the shadcn philosophy: copy-paste source, no runtime configuration, you own the file.

## Layers

```
Primitives  →  Blocks  →  Pages
(Button)       (FeatureCard)   (Landing)
```

## Install

```bash
bun x bosia@latest add block cards/feature
```

Files land in `src/lib/blocks/<category>/<name>/`. Primitive dependencies (Card, Button, etc.) install automatically.

## Theming

Blocks consume **semantic tokens only** — `bg-card`, `text-foreground`, `font-display`. Swap themes without touching the block:

```bash
bun x bosia@latest add theme editorial
```

See [Themes](/docs/themes/overview/).
