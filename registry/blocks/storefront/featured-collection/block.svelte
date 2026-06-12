<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";
	import ProductGrid from "$lib/blocks/storefront/product-grid/block.svelte";
	import {
		sampleProducts,
		type Cart,
		type Product,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		eyebrow?: string;
		title?: string;
		sub?: string;
		products?: Product[];
		cart?: Cart;
	}

	let {
		eyebrow = "This week's edit",
		title = "Pieces we're loving right now",
		sub = "A small, rotating selection — chosen by the team and restocked while they last.",
		products = sampleProducts,
		cart,
	}: Props = $props();
</script>

<section class="bg-background py-16 sm:py-20 lg:py-24">
	<div class="mx-auto w-full max-w-6xl px-6">
		<div class="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-10">
			<div>
				{#if eyebrow}
					<span class="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-primary"
						>{eyebrow}</span
					>
				{/if}
				<h2 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
				{#if sub}<p class="mt-3 max-w-[52ch] text-lg text-muted-foreground">{sub}</p>{/if}
			</div>
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors hover:bg-muted"
			>
				View all <ArrowRight size={16} />
			</button>
		</div>
		<ProductGrid {products} {cart} />
	</div>
</section>
