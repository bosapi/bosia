<script lang="ts">
	interface Props {
		categories?: string[];
		prices?: string[];
		colors?: string[];
	}

	let {
		categories = ["Home", "Kitchen", "Pantry", "Living", "Gifts"],
		prices = ["Under $25", "$25–$50", "$50–$100", "$100+"],
		colors = ["#B65A3C", "#7C8A77", "#1B160E", "#C9B6A3", "#DCE6D5", "#2F5BD6"],
	}: Props = $props();

	let activeCat = $state("All");
	let activePrice = $state<string | null>(null);
	let activeColor = $state<string | null>(null);
	let inStockOnly = $state(false);

	const allCats = $derived(["All", ...categories]);
</script>

<aside class="flex flex-col gap-7">
	<!-- Category -->
	<div>
		<h5 class="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
			Category
		</h5>
		<div class="flex flex-col">
			{#each allCats as cat (cat)}
				<button
					type="button"
					onclick={() => (activeCat = cat)}
					class="py-1.5 text-left text-[15px] transition-colors hover:text-foreground {activeCat ===
					cat
						? 'font-semibold text-foreground'
						: 'text-muted-foreground'}"
				>
					{cat}
				</button>
			{/each}
		</div>
	</div>

	<!-- Price -->
	<div>
		<h5 class="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
			Price
		</h5>
		<div class="flex flex-wrap gap-2">
			{#each prices as price (price)}
				<button
					type="button"
					aria-pressed={activePrice === price}
					onclick={() => (activePrice = activePrice === price ? null : price)}
					class="rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors {activePrice ===
					price
						? 'border-foreground bg-foreground text-background'
						: 'border-border bg-card hover:border-muted-foreground/50'}"
				>
					{price}
				</button>
			{/each}
		</div>
	</div>

	<!-- Colour -->
	<div>
		<h5 class="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
			Colour
		</h5>
		<div class="flex flex-wrap gap-2.5">
			{#each colors as color (color)}
				<button
					type="button"
					aria-label="Filter by colour"
					aria-pressed={activeColor === color}
					onclick={() => (activeColor = activeColor === color ? null : color)}
					class="h-[26px] w-[26px] rounded-full border border-border transition {activeColor ===
					color
						? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
						: ''}"
					style="background: {color}"
				></button>
			{/each}
		</div>
	</div>

	<!-- Availability -->
	<div>
		<h5 class="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
			Availability
		</h5>
		<label class="flex cursor-pointer items-center gap-2.5 text-[15px] text-muted-foreground">
			<input type="checkbox" bind:checked={inStockOnly} class="h-4 w-4 accent-primary" />
			In stock only
		</label>
	</div>
</aside>
