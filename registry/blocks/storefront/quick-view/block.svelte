<script lang="ts">
	import { X } from "@lucide/svelte";
	import ProductOptions from "$lib/blocks/storefront/product-options/block.svelte";
	import {
		sampleProducts,
		type Cart,
		type Product,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		/** Two-way bindable; open it from a product card's onQuickView. */
		open?: boolean;
		product?: Product;
		/** Shared cart so add-to-bag lands in the real bag. */
		cart?: Cart;
	}

	let { open = $bindable(false), product = sampleProducts[0], cart }: Props = $props();
</script>

<!-- Backdrop -->
<button
	type="button"
	aria-label="Close quick view"
	tabindex={open ? 0 : -1}
	class="fixed inset-0 z-[90] bg-foreground/40 transition-opacity duration-200 {open
		? 'visible opacity-100'
		: 'invisible opacity-0'}"
	onclick={() => (open = false)}
></button>

<!-- Panel -->
<div
	role="dialog"
	aria-label="Quick view: {product.name}"
	class="fixed inset-x-4 top-1/2 z-[91] mx-auto max-h-[86vh] w-auto max-w-3xl -translate-y-1/2 overflow-y-auto rounded-xl bg-card text-card-foreground shadow-xl transition-all duration-200 sm:inset-x-6 {open
		? 'visible scale-100 opacity-100'
		: 'invisible scale-[0.98] opacity-0'}"
>
	<button
		type="button"
		class="absolute right-3.5 top-3.5 z-[1] inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/85 backdrop-blur transition-colors hover:bg-muted"
		aria-label="Close"
		onclick={() => (open = false)}
	>
		<X size={19} />
	</button>

	<div class="grid sm:grid-cols-2">
		<div class="relative aspect-[4/5] bg-muted sm:aspect-auto sm:min-h-full">
			{#if product.image}
				<img
					src={product.image}
					alt={product.name}
					class="absolute inset-0 h-full w-full object-cover"
				/>
			{/if}
		</div>
		<div class="flex flex-col gap-5 p-6 sm:p-7">
			<ProductOptions {product} {cart} />
			<a href="##" class="text-sm font-medium text-primary transition hover:brightness-110">
				View full details →
			</a>
		</div>
	</div>
</div>
