<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import WishlistGrid from "$lib/blocks/storefront/wishlist-grid/block.svelte";
	import Newsletter from "$lib/blocks/storefront/newsletter/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	const purpose = purposes.clay;
	const cart = createCart();

	// Seed a few favourites so the page has something to show on first visit.
	if (cart.favCount === 0) {
		for (const p of purpose.products.slice(0, 4)) cart.toggleFav(p);
	}
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
		<h1 class="mb-8 font-display text-3xl tracking-tight sm:text-4xl">
			Wishlist {#if cart.favCount > 0}<span class="text-muted-foreground/70">({cart.favCount})</span
				>{/if}
		</h1>

		<WishlistGrid {cart} products={purpose.products} />
	</main>

	<Newsletter />

	<Footer />

	<CartDrawer {cart} />
</div>
