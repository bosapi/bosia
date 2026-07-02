<script lang="ts">
	import { SearchX } from "@lucide/svelte";
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import SearchOverlay from "$lib/blocks/storefront/search-overlay/block.svelte";
	import SortBar from "$lib/blocks/storefront/sort-bar/block.svelte";
	import ProductGrid from "$lib/blocks/storefront/product-grid/block.svelte";
	import EmptyState from "$lib/blocks/storefront/empty-state/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	const purpose = purposes.clay;
	const cart = createCart();

	// Seed a query so the page shows results on first visit.
	let query = $state("kitchen");
	let sort = $state("Featured");
	let searchOpen = $state(false);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return purpose.products;
		return purpose.products.filter(
			(p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
		);
	});

	const sorted = $derived.by(() => {
		const list = [...filtered];
		if (sort === "Price: low to high") return list.sort((a, b) => a.price - b.price);
		if (sort === "Price: high to low") return list.sort((a, b) => b.price - a.price);
		if (sort === "Top rated") return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
		return list;
	});
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} onSearch={() => (searchOpen = true)} />

	<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
		{#if sorted.length > 0}
			<SortBar
				title={query.trim() ? `Results for “${query.trim()}”` : "Search"}
				count={sorted.length}
				breadcrumb={["Home", "Search"]}
				bind:sort
			/>
			<div class="mt-7">
				<ProductGrid products={sorted} {cart} />
			</div>
		{:else}
			<EmptyState
				icon={SearchX}
				title={`No results for “${query.trim()}”`}
				sub="Check the spelling or try a broader term."
				cta="Clear search"
				onCta={() => (query = "")}
			/>
		{/if}
	</main>

	<Footer />

	<SearchOverlay
		bind:open={searchOpen}
		products={purpose.products}
		onSelect={(p) => (query = p.name)}
		onSubmit={(q) => (query = q)}
	/>

	<CartDrawer {cart} />
</div>
