<script lang="ts">
	import { Heart, ShoppingBag } from "@lucide/svelte";
	import ProductCard from "$lib/blocks/storefront/product-card/block.svelte";
	import EmptyState from "$lib/blocks/storefront/empty-state/block.svelte";
	import {
		createCart,
		sampleProducts,
		type Cart,
		type Product,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		/** Shared cart instance; omit to render a self-contained demo wishlist. */
		cart?: Cart;
		/** Catalogue to match favourites against. */
		products?: Product[];
		onMoveToCart?: (product: Product) => void;
		/** Fired by the empty state's CTA. */
		onBrowse?: () => void;
	}

	let { cart, products = sampleProducts, onMoveToCart, onBrowse }: Props = $props();

	// Standalone fallback: pre-fav a few products so the block renders on its own.
	const standalone = createCart();
	if (standalone.favCount === 0) {
		for (const p of sampleProducts.slice(0, 4)) standalone.toggleFav(p);
	}

	const c = $derived(cart ?? standalone);
	const faved = $derived(products.filter((p) => c.isFaved(p.name)));

	function moveToCart(product: Product) {
		c.add(product);
		c.toggleFav(product);
		onMoveToCart?.(product);
	}
</script>

{#if faved.length === 0}
	<EmptyState
		icon={Heart}
		title="Your wishlist is empty"
		sub="Tap the heart on any product to save it for later."
		cta="Browse products"
		onCta={onBrowse}
	/>
{:else}
	<div class="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
		{#each faved as product (product.name)}
			<div class="flex flex-col gap-3">
				<ProductCard
					{product}
					faved={c.isFaved(product.name)}
					onAdd={(p) => c.add(p)}
					onFav={(p) => c.toggleFav(p)}
				/>
				<button
					type="button"
					onclick={() => moveToCart(product)}
					class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold transition hover:bg-muted"
				>
					<ShoppingBag size={15} /> Move to bag
				</button>
			</div>
		{/each}
	</div>
{/if}
