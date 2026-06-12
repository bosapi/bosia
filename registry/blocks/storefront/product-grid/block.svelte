<script lang="ts">
	import ProductCard from "$lib/blocks/storefront/product-card/block.svelte";
	import {
		sampleProducts,
		type Cart,
		type Product,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		products?: Product[];
		/** Shared cart — when provided, cards add to bag and toggle favourites. */
		cart?: Cart;
	}

	let { products = sampleProducts, cart }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-3 xl:grid-cols-4">
	{#each products as product (product.name)}
		<ProductCard
			{product}
			faved={cart ? cart.isFaved(product.name) : undefined}
			onAdd={cart ? (p) => cart.add(p) : undefined}
			onFav={cart ? (p) => cart.toggleFav(p) : undefined}
		/>
	{/each}
</div>
