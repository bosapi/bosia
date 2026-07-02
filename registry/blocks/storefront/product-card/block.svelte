<script lang="ts">
	import { Eye, Heart, ShoppingBag, Star } from "@lucide/svelte";
	import { money, type Product } from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		product?: Product;
		faved?: boolean;
		onAdd?: (product: Product) => void;
		onFav?: (product: Product) => void;
		/** When set, shows an eye button next to the heart (open a quick-view). */
		onQuickView?: (product: Product) => void;
	}

	const fallback: Product = {
		name: "Stoneware Dinner Set",
		category: "Kitchen",
		price: 78,
		compareAt: null,
		badge: "new",
		rating: 4.8,
		reviews: 214,
		image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80",
		swatches: ["#C9B6A3", "#7C8A77", "#2A2419"],
	};

	let { product = fallback, faved, onAdd, onFav, onQuickView }: Props = $props();

	// Standalone fallback when no shared state is wired in.
	let localFav = $state(false);
	const isFav = $derived(faved ?? localFav);

	const badgeText: Record<string, string> = { new: "New", sale: "Sale", low: "Low stock" };

	function add(e: MouseEvent) {
		e.preventDefault();
		onAdd?.(product);
	}
	function fav(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (onFav) onFav(product);
		else localFav = !localFav;
	}
</script>

<a href="##" class="group relative flex flex-col gap-3 text-foreground no-underline">
	<div class="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
		{#if product.image}
			<img
				src={product.image}
				alt={product.name}
				loading="lazy"
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]"
			/>
		{/if}

		<!-- Badges -->
		<div class="absolute left-3 top-3 z-[3] flex flex-col items-start gap-1.5">
			{#if product.badge}
				<span
					class="inline-flex items-center rounded px-2.5 py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.08em] {product.badge ===
					'sale'
						? 'bg-destructive text-destructive-foreground'
						: product.badge === 'new'
							? 'bg-foreground text-background'
							: 'bg-primary/10 text-primary'}"
				>
					{badgeText[product.badge]}
				</span>
			{/if}
			{#if product.compareAt && product.badge !== "sale"}
				<span
					class="inline-flex items-center rounded bg-destructive px-2.5 py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-destructive-foreground"
					>Sale</span
				>
			{/if}
		</div>

		<!-- Favourite -->
		<button
			type="button"
			onclick={fav}
			aria-label="Save"
			class="absolute right-2.5 top-2.5 z-[3] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card/85 shadow-sm backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-[-4px] sm:opacity-0 {isFav
				? 'text-destructive'
				: 'text-foreground'}"
		>
			<Heart size={18} class={isFav ? "fill-destructive" : ""} />
		</button>

		{#if onQuickView}
			<button
				type="button"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onQuickView(product);
				}}
				aria-label="Quick view"
				class="absolute right-2.5 top-[52px] z-[3] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card/85 text-foreground shadow-sm backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-[-4px] sm:opacity-0"
			>
				<Eye size={18} />
			</button>
		{/if}

		<!-- Quick add -->
		<div
			class="absolute inset-x-3 bottom-3 z-[3] translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
		>
			<button
				type="button"
				onclick={add}
				class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition hover:brightness-110"
			>
				<ShoppingBag size={16} /> Add to bag
			</button>
		</div>
	</div>

	<!-- Meta -->
	<div class="flex flex-col gap-0.5">
		<span class="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70"
			>{product.category}</span
		>
		<span class="text-base font-medium leading-tight">{product.name}</span>
		{#if product.rating != null}
			<span class="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
				<span class="inline-flex">
					{#each Array(5) as _, i (i)}
						<Star
							size={13}
							class={i < Math.round(product.rating ?? 0)
								? "fill-amber-500 text-amber-500"
								: "fill-muted text-muted-foreground/40"}
						/>
					{/each}
				</span>
				{#if product.reviews != null}<span>({product.reviews})</span>{/if}
			</span>
		{/if}
		<span class="mt-0.5 flex items-baseline gap-2">
			<span class="font-medium tabular-nums {product.compareAt ? 'text-destructive' : ''}"
				>{money(product.price)}</span
			>
			{#if product.compareAt}
				<span class="text-sm text-muted-foreground/70 line-through">{money(product.compareAt)}</span
				>
			{/if}
		</span>
		{#if product.swatches}
			<span class="mt-1 flex gap-1.5">
				{#each product.swatches as color (color)}
					<span
						class="h-[15px] w-[15px] rounded-full border border-border"
						style="background: {color}"
					></span>
				{/each}
			</span>
		{/if}
	</div>
</a>
