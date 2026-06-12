---
title: Storefront — Checkout
description: Multi-step checkout form, promo field, order summary and the confirmed state.
demo: StorefrontCheckoutDemo
---

Everything for the checkout flow: a four-step form, the sticky order summary (which embeds the
promo field), and the order-confirmed success screen.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/checkout-form
bun x bosia@latest add block storefront/order-summary
bun x bosia@latest add block storefront/promo-field
bun x bosia@latest add block storefront/order-confirmed
```

`checkout-form` and `order-summary` pull `storefront/store`; `order-summary` includes `promo-field`.

## Usage

```svelte
<script lang="ts">
	import CheckoutForm from "$lib/blocks/storefront/checkout-form/block.svelte";
	import OrderSummary from "$lib/blocks/storefront/order-summary/block.svelte";
	import OrderConfirmed from "$lib/blocks/storefront/order-confirmed/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
	let placed = $state(false);
	let delivery = $state<"standard" | "express">("standard");
</script>

{#if placed}
	<OrderConfirmed onContinue={() => (placed = false)} />
{:else}
	<div class="grid lg:grid-cols-[1.4fr_1fr] gap-12">
		<CheckoutForm subtotal={cart.subtotal} bind:delivery />
		<OrderSummary {cart} onPlaceOrder={() => (placed = true)} />
	</div>
{/if}
```

`checkout-form` exposes a bindable `delivery`; `order-summary` takes a `cart`, `shipping`, `taxRate`
and an `onPlaceOrder` callback. Swap to `order-confirmed` once the order is placed.

## Source

`src/lib/blocks/storefront/{checkout-form,order-summary,promo-field,order-confirmed}/block.svelte`
