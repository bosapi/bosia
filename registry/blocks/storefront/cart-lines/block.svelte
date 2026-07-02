<script lang="ts">
	import { Minus, Plus, X } from "@lucide/svelte";
	import EmptyState from "$lib/blocks/storefront/empty-state/block.svelte";
	import {
		createCart,
		money,
		sampleProducts,
		type Cart,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		/** Shared cart instance; omit to render a self-contained demo list. */
		cart?: Cart;
		/** Fired by the empty state's CTA. */
		onContinue?: () => void;
	}

	let { cart, onContinue }: Props = $props();

	// Standalone fallback: a pre-filled cart so the block renders on its own.
	const standalone = createCart(
		sampleProducts.slice(0, 3).map((p) => ({
			name: p.name,
			category: p.category,
			price: p.price,
			image: p.image,
			qty: 1,
		})),
	);

	const c = $derived(cart ?? standalone);
</script>

{#if c.items.length === 0}
	<EmptyState onCta={onContinue} />
{:else}
	<div class="flex flex-col">
		{#each c.items as item (item.name)}
			<div class="flex gap-4 border-b border-border py-5 first:pt-0 sm:gap-5">
				<div class="h-28 w-[88px] flex-none overflow-hidden rounded-lg bg-muted">
					{#if item.image}
						<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
					{/if}
				</div>
				<div class="flex flex-1 flex-col gap-1">
					<span class="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70"
						>{item.category}</span
					>
					<span class="text-[15px] font-medium sm:text-base">{item.name}</span>
					<span class="text-sm text-muted-foreground tabular-nums">{money(item.price)} each</span>
					<div class="mt-auto flex items-center justify-between pt-2">
						<div class="inline-flex items-center overflow-hidden rounded-lg border border-border">
							<button
								type="button"
								class="grid h-9 w-9 place-items-center transition-colors hover:bg-muted"
								aria-label="Decrease"
								onclick={() => c.setQty(item.name, item.qty - 1)}
							>
								<Minus size={15} />
							</button>
							<span class="min-w-8 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
							<button
								type="button"
								class="grid h-9 w-9 place-items-center transition-colors hover:bg-muted"
								aria-label="Increase"
								onclick={() => c.setQty(item.name, item.qty + 1)}
							>
								<Plus size={15} />
							</button>
						</div>
						<span class="font-medium tabular-nums">{money(item.price * item.qty)}</span>
					</div>
				</div>
				<button
					type="button"
					class="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					aria-label="Remove {item.name}"
					onclick={() => c.setQty(item.name, 0)}
				>
					<X size={17} />
				</button>
			</div>
		{/each}
	</div>
{/if}
