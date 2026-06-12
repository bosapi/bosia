---
title: Pages — Storefront Checkout
description: Multi-step checkout with order summary and a confirmation state.
demo: PagesCheckoutDemo
---

The Mercato checkout: header, a four-step form (contact, shipping, delivery, payment), a sticky
order summary, and an order-confirmed success screen after placing the order.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/checkout
```

Installs `page.svelte` plus the storefront blocks it composes.

## Usage

```svelte
<script lang="ts">
	import Checkout from "$lib/pages/storefront/checkout/page.svelte";
</script>

<Checkout />
```

The bag is seeded from the catalogue so the summary totals something; shipping reacts to the chosen
delivery method, and placing the order swaps in the confirmation screen. Wire the form fields and
`onPlaceOrder` to your backend.

## Source

`src/lib/pages/storefront/checkout/page.svelte`
