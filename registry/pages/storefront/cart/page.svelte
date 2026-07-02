<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import CartLines from "$lib/blocks/storefront/cart-lines/block.svelte";
	import OrderSummary from "$lib/blocks/storefront/order-summary/block.svelte";
	import FeaturedCollection from "$lib/blocks/storefront/featured-collection/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import { createCart, type CartItem } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	const purpose = purposes.clay;

	// Seed the bag so the page has something to show on first visit.
	const initial: CartItem[] = purpose.products.slice(0, 2).map((p) => ({
		name: p.name,
		category: p.category,
		price: p.price,
		image: p.image,
		qty: 1,
	}));
	const cart = createCart(initial);

	const shipping = $derived(cart.subtotal >= 50 || cart.subtotal === 0 ? 0 : 6);
	const related = $derived(
		purpose.products.filter((p) => !cart.items.some((i) => i.name === p.name)).slice(0, 4),
	);
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
		<h1 class="mb-8 font-display text-3xl tracking-tight sm:text-4xl">
			Your bag {#if cart.count > 0}<span class="text-muted-foreground/70">({cart.count})</span>{/if}
		</h1>

		{#if cart.items.length > 0}
			<div class="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
				<CartLines {cart} />
				<OrderSummary {cart} {shipping} cta="Checkout" />
			</div>
		{:else}
			<CartLines {cart} />
		{/if}
	</main>

	<FeaturedCollection
		eyebrow="Before you go"
		title="You might also like"
		sub=""
		products={related}
		{cart}
	/>

	<Footer />
</div>
