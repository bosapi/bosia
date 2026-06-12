<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import CheckoutForm from "$lib/blocks/storefront/checkout-form/block.svelte";
	import OrderSummary from "$lib/blocks/storefront/order-summary/block.svelte";
	import OrderConfirmed from "$lib/blocks/storefront/order-confirmed/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import { createCart, type CartItem } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	const purpose = purposes.clay;

	// Seed the bag so the summary has something to total.
	const initial: CartItem[] = purpose.products.slice(0, 2).map((p) => ({
		name: p.name,
		category: p.category,
		price: p.price,
		image: p.image,
		qty: 1,
	}));
	const cart = createCart(initial);

	let placed = $state(false);
	let delivery = $state<"standard" | "express">("standard");

	const shipping = $derived(delivery === "express" ? 12 : cart.subtotal >= 50 ? 0 : 6);

	function placeOrder() {
		placed = true;
		if (typeof window !== "undefined") window.scrollTo({ top: 0 });
	}
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	{#if placed}
		<OrderConfirmed onContinue={() => (placed = false)} />
	{:else}
		<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
			<h1 class="mb-8 font-display text-3xl tracking-tight sm:text-4xl">Checkout</h1>
			<div class="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
				<CheckoutForm subtotal={cart.subtotal} bind:delivery />
				<OrderSummary {cart} {shipping} onPlaceOrder={placeOrder} />
			</div>
		</main>
	{/if}

	<Footer />
</div>
