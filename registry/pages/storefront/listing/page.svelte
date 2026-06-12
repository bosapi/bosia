<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import SortBar from "$lib/blocks/storefront/sort-bar/block.svelte";
	import FilterSidebar from "$lib/blocks/storefront/filter-sidebar/block.svelte";
	import ProductGrid from "$lib/blocks/storefront/product-grid/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	const purpose = purposes.clay;
	const cart = createCart();

	let sort = $state("Featured");

	const sorted = $derived.by(() => {
		const list = [...purpose.products];
		if (sort === "Price: low to high") return list.sort((a, b) => a.price - b.price);
		if (sort === "Price: high to low") return list.sort((a, b) => b.price - a.price);
		if (sort === "Top rated") return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
		return list;
	});
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
		<SortBar
			title={purpose.label}
			count={purpose.products.length}
			breadcrumb={["Home", purpose.label]}
			bind:sort
		/>

		<div class="mt-7 grid gap-8 lg:grid-cols-[232px_1fr] lg:gap-12">
			<div class="lg:sticky lg:top-24 lg:self-start">
				<FilterSidebar categories={purpose.categories} />
			</div>
			<ProductGrid products={sorted} {cart} />
		</div>
	</main>

	<Footer />

	<CartDrawer {cart} />
</div>
