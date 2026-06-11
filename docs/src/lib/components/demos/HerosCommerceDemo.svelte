<script lang="ts">
	import ShopSplit from "$blocks/heros/shop-split/block.svelte";
	import Sale from "$blocks/heros/sale/block.svelte";
	import Bags from "$blocks/heros/bags/block.svelte";
	import Bookstore from "$blocks/heros/bookstore/block.svelte";
	import Toys from "$blocks/heros/toys/block.svelte";
	import HomeGoods from "$blocks/heros/home-goods/block.svelte";
	import Apparel from "$blocks/heros/apparel/block.svelte";
</script>

<div class="max-h-[80vh] divide-y divide-border overflow-y-auto rounded-lg border border-border">
	<ShopSplit />
	<Sale />
	<Bags />
	<Bookstore />
	<Toys />
	<HomeGoods />
	<Apparel />
</div>
