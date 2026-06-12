<script lang="ts">
	import FeaturedCollection from "$blocks/storefront/featured-collection/block.svelte";
	import { createCart } from "$blocks/storefront/store/store.svelte.ts";

	// A shared cart wires add-to-bag and favourites across the grid.
	const cart = createCart();
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background">
	<FeaturedCollection {cart} />
</div>
