<script lang="ts">
	import { ShieldCheck } from "@lucide/svelte";
	import PromoField from "$lib/blocks/storefront/promo-field/block.svelte";
	import { money, type Cart, type CartItem } from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		cart?: Cart;
		items?: CartItem[];
		shipping?: number;
		taxRate?: number;
		/** Button label; the total is appended. */
		cta?: string;
		onPlaceOrder?: () => void;
	}

	const sampleItems: CartItem[] = [
		{
			name: "Stoneware Dinner Set",
			category: "Kitchen",
			price: 78,
			qty: 1,
			image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&q=80",
		},
		{
			name: "Hand-Thrown Mug",
			category: "Kitchen",
			price: 24,
			qty: 1,
			image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80",
		},
	];

	let {
		cart,
		items,
		shipping = 0,
		taxRate = 0.08,
		cta = "Place order",
		onPlaceOrder,
	}: Props = $props();

	const lines = $derived(cart ? cart.items : (items ?? sampleItems));
	const subtotal = $derived(
		cart ? cart.subtotal : lines.reduce((sum, x) => sum + x.price * x.qty, 0),
	);
	const tax = $derived(subtotal * taxRate);
	const total = $derived(subtotal + shipping + tax);
</script>

<aside class="rounded-xl border border-border bg-muted/40 p-6 sm:p-7 lg:sticky lg:top-24">
	<h3 class="mb-2 font-display text-[22px]">Order summary</h3>

	<div>
		{#each lines as item (item.name)}
			<div class="flex gap-3.5 border-b border-muted py-3.5 last:border-b-0">
				<div class="h-[70px] w-14 flex-none overflow-hidden rounded">
					{#if item.image}
						<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
					{:else}
						<div class="h-full w-full bg-muted"></div>
					{/if}
				</div>
				<div class="flex-1">
					<div class="text-[15px] font-medium">{item.name}</div>
					<div class="text-sm text-muted-foreground/70">{item.category} · Qty {item.qty}</div>
				</div>
				<span class="font-medium tabular-nums">{money(item.price * item.qty)}</span>
			</div>
		{/each}
	</div>

	<div class="my-[18px]">
		<PromoField />
	</div>

	<div class="flex justify-between py-1.5 text-muted-foreground">
		<span>Subtotal</span><span class="font-medium tabular-nums text-foreground"
			>{money(subtotal)}</span
		>
	</div>
	<div class="flex justify-between py-1.5 text-muted-foreground">
		<span>Shipping</span><span class="font-medium tabular-nums text-foreground"
			>{shipping === 0 ? "Free" : money(shipping)}</span
		>
	</div>
	<div class="flex justify-between py-1.5 text-muted-foreground">
		<span>Estimated tax</span><span class="font-medium tabular-nums text-foreground"
			>{money(tax)}</span
		>
	</div>
	<div class="mt-2 flex justify-between border-t border-border pt-4 text-xl font-bold">
		<span>Total</span><span class="tabular-nums">{money(total)}</span>
	</div>

	<button
		type="button"
		onclick={onPlaceOrder}
		class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:brightness-110"
	>
		{cta} · {money(total)}
	</button>
	<p class="mt-3.5 flex items-center justify-center gap-2 text-[13px] text-muted-foreground/70">
		<ShieldCheck size={15} /> Encrypted & secure payment
	</p>
</aside>
