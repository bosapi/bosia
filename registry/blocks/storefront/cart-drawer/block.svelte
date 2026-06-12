<script lang="ts">
	import { X, ShoppingBag, Minus, Plus } from "@lucide/svelte";
	import { createCart, money, type Cart } from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		/** Shared cart instance; omit to render a self-contained demo drawer. */
		cart?: Cart;
	}

	let { cart }: Props = $props();

	// Standalone fallback: a pre-filled, open drawer so the block renders on its own.
	const standalone = createCart([
		{ name: "Stoneware Dinner Set", category: "Kitchen", price: 78, qty: 1 },
		{ name: "Hand-Thrown Mug", category: "Kitchen", price: 24, qty: 2 },
	]);
	standalone.open = true;

	const c = $derived(cart ?? standalone);
	const FREE_OVER = 50;
	const ship = $derived(c.subtotal >= FREE_OVER || c.subtotal === 0 ? 0 : 6);
</script>

<!-- Overlay -->
<button
	type="button"
	aria-label="Close cart"
	tabindex={c.open ? 0 : -1}
	class="fixed inset-0 z-[90] bg-foreground/40 transition-opacity duration-200 {c.open
		? 'visible opacity-100'
		: 'invisible opacity-0'}"
	onclick={() => (c.open = false)}
></button>

<!-- Drawer -->
<aside
	class="fixed inset-y-0 right-0 z-[91] flex w-[min(420px,92vw)] flex-col bg-card text-card-foreground shadow-xl transition-transform duration-200 {c.open
		? 'translate-x-0'
		: 'translate-x-full'}"
	aria-label="Shopping bag"
>
	<div class="flex items-center justify-between border-b border-border px-6 py-5">
		<h3 class="font-display text-[22px]">Your bag ({c.count})</h3>
		<button
			type="button"
			class="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full transition-colors hover:bg-muted"
			aria-label="Close"
			onclick={() => (c.open = false)}
		>
			<X size={20} />
		</button>
	</div>

	<div class="flex-1 overflow-y-auto px-6 py-2">
		{#if c.items.length === 0}
			<div class="py-16 text-center text-muted-foreground/70">
				<ShoppingBag size={40} strokeWidth={1.3} class="mx-auto" />
				<p class="mt-3">Your bag is empty.</p>
			</div>
		{/if}

		{#each c.items as item (item.name)}
			<div class="flex gap-3.5 border-b border-muted py-4">
				<div class="h-20 w-16 flex-none overflow-hidden rounded-lg bg-muted">
					{#if item.image}
						<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
					{/if}
				</div>
				<div class="flex flex-1 flex-col gap-1">
					<span class="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70"
						>{item.category}</span
					>
					<span class="font-medium">{item.name}</span>
					<div class="mt-1 flex items-center justify-between">
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
			</div>
		{/each}
	</div>

	{#if c.items.length > 0}
		<div class="border-t border-border px-6 py-5">
			<div class="mb-1.5 flex justify-between">
				<span class="text-muted-foreground">Subtotal</span>
				<span class="font-medium tabular-nums">{money(c.subtotal)}</span>
			</div>
			<div class="mb-3.5 flex justify-between">
				<span class="text-muted-foreground">Shipping</span>
				<span class="font-medium tabular-nums">{ship === 0 ? "Free" : money(ship)}</span>
			</div>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Checkout · {money(c.subtotal + ship)}
			</button>
			<p class="mt-2.5 text-center text-sm text-muted-foreground/70">
				{c.subtotal >= FREE_OVER
					? "You've unlocked free delivery"
					: `Add ${money(FREE_OVER - c.subtotal)} for free delivery`}
			</p>
		</div>
	{/if}
</aside>
