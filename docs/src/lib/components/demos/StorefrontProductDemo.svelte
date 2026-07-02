<script lang="ts">
	import ProductGallery from "$blocks/storefront/product-gallery/block.svelte";
	import ProductOptions from "$blocks/storefront/product-options/block.svelte";
	import TrustRow from "$blocks/storefront/trust-row/block.svelte";
	import PdpAccordions from "$blocks/storefront/pdp-accordions/block.svelte";
	import Reviews from "$blocks/storefront/reviews/block.svelte";
	import ProductCard from "$blocks/storefront/product-card/block.svelte";
	import QuickView from "$blocks/storefront/quick-view/block.svelte";
	import {
		createCart,
		sampleProducts,
		type Product,
	} from "$blocks/storefront/store/store.svelte.ts";

	const cart = createCart();

	let quickViewOpen = $state(false);
	let quickViewProduct = $state<Product>(sampleProducts[0]);
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background p-6">
	<div class="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
		<ProductGallery />
		<div class="flex flex-col gap-6">
			<ProductOptions {cart} />
			<TrustRow />
			<PdpAccordions />
		</div>
	</div>

	<div class="mt-12 border-t border-border pt-8">
		<h3 class="mb-4 font-display text-lg">Quick view</h3>
		<p class="mb-4 text-sm text-muted-foreground">
			Hover a card and tap the eye to open the quick-view modal.
		</p>
		<div class="grid max-w-md grid-cols-2 gap-5">
			{#each sampleProducts.slice(0, 2) as product (product.name)}
				<ProductCard
					{product}
					onAdd={(p) => cart.add(p)}
					onQuickView={(p) => {
						quickViewProduct = p;
						quickViewOpen = true;
					}}
				/>
			{/each}
		</div>
	</div>

	<div class="mt-12 border-t border-border pt-8">
		<Reviews />
	</div>
</div>

<QuickView bind:open={quickViewOpen} product={quickViewProduct} {cart} />
