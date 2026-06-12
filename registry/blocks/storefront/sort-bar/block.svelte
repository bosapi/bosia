<script lang="ts">
	import { ChevronRight } from "@lucide/svelte";

	interface Props {
		title?: string;
		count?: number;
		breadcrumb?: string[];
		sortOptions?: string[];
		/** Two-way bindable selected sort. */
		sort?: string;
	}

	let {
		title = "All products",
		count = 8,
		breadcrumb = ["Home", "Shop"],
		sortOptions = ["Featured", "Price: low to high", "Price: high to low", "Top rated", "Newest"],
		sort = $bindable("Featured"),
	}: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<nav class="flex items-center gap-2 text-[13px] text-muted-foreground/70" aria-label="Breadcrumb">
		{#each breadcrumb as crumb, i (crumb)}
			{#if i > 0}<ChevronRight size={13} />{/if}
			<a href="##" class="transition-colors hover:text-foreground">{crumb}</a>
		{/each}
	</nav>

	<div class="flex flex-wrap items-end justify-between gap-6">
		<div>
			<h1 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{count} products</p>
		</div>
		<label class="inline-flex items-center gap-2 text-sm text-muted-foreground">
			Sort
			<select
				bind:value={sort}
				class="rounded-lg border border-border bg-card px-3 py-2 text-[15px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
			>
				{#each sortOptions as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>
	</div>
</div>
