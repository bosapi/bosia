<script lang="ts">
	import { Star, Minus, Plus, ShoppingBag, Heart } from "@lucide/svelte";
	import { money, type Cart, type Product } from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		product?: Product;
		sizes?: string[];
		cart?: Cart;
	}

	const fallback: Product = {
		name: "Stoneware Dinner Set",
		category: "Kitchen",
		price: 78,
		compareAt: 96,
		rating: 4.8,
		reviews: 214,
		swatches: ["#B65A3C", "#7C8A77", "#1B160E"],
	};

	let { product = fallback, sizes = ["XS", "S", "M", "L", "XL"], cart }: Props = $props();

	const colors = $derived(product.swatches ?? ["#B65A3C", "#7C8A77", "#1B160E"]);
	let color = $state(0);
	let size = $state("M");
	let qty = $state(1);

	function add() {
		cart?.add(product, qty);
	}
</script>

<div class="flex flex-col gap-4 pt-2">
	<span class="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70"
		>{product.category}</span
	>
	<h1 class="font-display text-3xl tracking-tight sm:text-4xl">{product.name}</h1>

	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<span class="inline-flex">
			{#each Array(5) as _, i (i)}
				<Star
					size={15}
					class={i < Math.round(product.rating ?? 0)
						? "fill-amber-500 text-amber-500"
						: "fill-muted text-muted-foreground/40"}
				/>
			{/each}
		</span>
		{#if product.reviews != null}<span>{product.reviews} reviews</span>{/if}
	</div>

	<div class="flex items-baseline gap-3">
		<span class="font-display text-3xl font-semibold tabular-nums">{money(product.price)}</span>
		{#if product.compareAt}
			<span class="text-lg text-muted-foreground/70 line-through">{money(product.compareAt)}</span>
		{/if}
	</div>

	<!-- Colour -->
	<div class="flex flex-col gap-2.5">
		<span class="text-[13px] font-semibold text-muted-foreground">Colour</span>
		<div class="flex gap-2.5">
			{#each colors as c, i (c)}
				<button
					type="button"
					aria-label="Colour {i + 1}"
					onclick={() => (color = i)}
					class="h-9 w-9 rounded-full border-[1.5px] border-border transition {color === i
						? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
						: ''}"
					style="background: {c}"
				></button>
			{/each}
		</div>
	</div>

	<!-- Size -->
	<div class="flex flex-col gap-2.5">
		<span class="text-[13px] font-semibold text-muted-foreground">Size</span>
		<div class="flex flex-wrap gap-2">
			{#each sizes as s (s)}
				<button
					type="button"
					onclick={() => (size = s)}
					class="h-11 min-w-12 rounded-lg border-[1.5px] px-3.5 text-sm font-semibold transition {size ===
					s
						? 'border-foreground bg-foreground text-background'
						: 'border-border bg-card hover:border-muted-foreground/50'}"
				>
					{s}
				</button>
			{/each}
		</div>
	</div>

	<!-- Quantity + add -->
	<div class="mt-2 flex flex-wrap gap-3">
		<div class="inline-flex items-center overflow-hidden rounded-lg border border-border">
			<button
				type="button"
				class="grid h-12 w-11 place-items-center transition-colors hover:bg-muted"
				aria-label="Decrease"
				onclick={() => (qty = Math.max(1, qty - 1))}
			>
				<Minus size={16} />
			</button>
			<span class="min-w-8 text-center font-semibold tabular-nums">{qty}</span>
			<button
				type="button"
				class="grid h-12 w-11 place-items-center transition-colors hover:bg-muted"
				aria-label="Increase"
				onclick={() => (qty += 1)}
			>
				<Plus size={16} />
			</button>
		</div>
		<button
			type="button"
			onclick={add}
			class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
		>
			<ShoppingBag size={18} /> Add to bag · {money(product.price * qty)}
		</button>
		<button
			type="button"
			aria-label="Save"
			class="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
		>
			<Heart size={18} />
		</button>
	</div>
</div>
