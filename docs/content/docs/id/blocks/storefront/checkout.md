---
title: Storefront — Checkout
description: Form checkout multi-langkah, field promo, ringkasan pesanan, dan state terkonfirmasi.
demo: StorefrontCheckoutDemo
---

Semua untuk alur checkout: form empat langkah, ringkasan pesanan lengket (yang menyematkan field
promo), dan layar sukses pesanan-terkonfirmasi.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/checkout-form
bun x bosia@latest add block storefront/order-summary
bun x bosia@latest add block storefront/promo-field
bun x bosia@latest add block storefront/order-confirmed
```

`checkout-form` dan `order-summary` menarik `storefront/store`; `order-summary` menyertakan `promo-field`.

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

`checkout-form` mengekspos `delivery` yang dapat di-bind; `order-summary` menerima `cart`, `shipping`,
`taxRate`, label `cta` opsional (default "Place order" — halaman keranjang mengirim "Checkout"), dan
callback `onPlaceOrder`. Ganti ke `order-confirmed` setelah pesanan ditempatkan.

## Source

`src/lib/blocks/storefront/{checkout-form,order-summary,promo-field,order-confirmed}/block.svelte`
