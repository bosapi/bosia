---
title: Cards — Commerce
description: Product, pricing, order, and review cards for e-commerce.
demo: CardsCommerceDemo
---

Commerce cards for storefronts and checkout flows. The brand colour maps to `--primary`, so
CTAs, badges, and the featured pricing border follow the active theme.

## Preview

## Install

Each card installs on its own:

```bash
bun x bosia@latest add block cards/product
bun x bosia@latest add block cards/pricing
bun x bosia@latest add block cards/order
bun x bosia@latest add block cards/review
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Pricing from "$lib/blocks/cards/pricing/block.svelte";
</script>

<Pricing featured />
```

The pricing card accepts a `featured` prop (default `true`) that toggles the highlighted border
and primary CTA. Like and add-to-bag toggles on the product card are cosmetic local `$state`.
