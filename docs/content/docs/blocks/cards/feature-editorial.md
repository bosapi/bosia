---
title: Card — Feature (Editorial)
description: Editorial feature card with numeral eyebrow, serif title, and circular CTA. Pairs with the editorial theme.
demo: CardFeatureEditorialDemo
---

```bash
bun x bosia@latest add block cards/feature-editorial
```

A magazine-style feature card: oversized serif numeral top-left, small uppercase tag top-right, serif title, body, circular icon CTA bottom-right. Pairs with the [editorial theme](/docs/themes/editorial/) but degrades gracefully on any theme.

## Preview

## Theme requirement

Looks best with the editorial theme installed:

```bash
bun x bosia@latest add theme editorial
```

On the default `neutral` theme it falls back to the system stack — still legible, just without the serif personality.

## Composition

Built from `Card` + `Button` primitives. All design tokens semantic — no raw colors or fonts. Edit `block.svelte` to change copy.

## Source

`src/lib/blocks/cards/feature-editorial/block.svelte`
