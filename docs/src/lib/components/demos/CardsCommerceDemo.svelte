<script lang="ts">
	import Product from "$blocks/cards/product/block.svelte";
	import Pricing from "$blocks/cards/pricing/block.svelte";
	import Order from "$blocks/cards/order/block.svelte";
	import Review from "$blocks/cards/review/block.svelte";
</script>

<div class="flex flex-wrap items-start justify-center gap-5 p-6">
	<Product />
	<Pricing />
	<Order />
	<Review />
</div>
