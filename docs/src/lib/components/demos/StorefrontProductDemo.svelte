<script lang="ts">
	import ProductGallery from "$blocks/storefront/product-gallery/block.svelte";
	import ProductOptions from "$blocks/storefront/product-options/block.svelte";
	import TrustRow from "$blocks/storefront/trust-row/block.svelte";
	import PdpAccordions from "$blocks/storefront/pdp-accordions/block.svelte";
	import Reviews from "$blocks/storefront/reviews/block.svelte";
	import { createCart } from "$blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
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
		<Reviews />
	</div>
</div>
