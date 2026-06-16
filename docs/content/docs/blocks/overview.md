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

## Page blocks don't include a navbar

Page-level blocks (heros, cards, sections) don't carry their own site navbar — that's deliberate. The navbar, footer, and sidebar belong in your `+layout.svelte` so they render once across every route. Pair a page block with a [navbar block](/docs/blocks/navbars/standard/) placed in the layout; dropping a hero on a page and a navbar in the layout gives you exactly one navbar, not two.

## Theming

Blocks consume **semantic tokens only** — `bg-card`, `text-foreground`, `font-display`. Swap themes without touching the block:

```bash
bun x bosia@latest add theme editorial
```

See [Themes](/docs/themes/overview/).
