<script lang="ts">
	import SortBar from "$blocks/storefront/sort-bar/block.svelte";
	import FilterSidebar from "$blocks/storefront/filter-sidebar/block.svelte";
	import ProductGrid from "$blocks/storefront/product-grid/block.svelte";
	import { createCart } from "$blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background p-6">
	<SortBar />
	<div class="mt-6 grid gap-8 lg:grid-cols-[232px_1fr]">
		<FilterSidebar />
		<ProductGrid {cart} />
	</div>
</div>
