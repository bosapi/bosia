<script lang="ts">
	import { Search, X } from "@lucide/svelte";
	import {
		money,
		sampleProducts,
		type Product,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		/** Two-way bindable; open it from the header's onSearch. */
		open?: boolean;
		/** Catalogue to search across. */
		products?: Product[];
		placeholder?: string;
		/** Chips shown while the query is empty. */
		popular?: string[];
		/** A result was picked (click or Enter). */
		onSelect?: (product: Product) => void;
		/** Enter pressed with a free-text query and no highlighted result. */
		onSubmit?: (query: string) => void;
	}

	let {
		open = $bindable(false),
		products = sampleProducts,
		placeholder = "Search products…",
		popular = ["Mug", "Linen", "Candle", "Kitchen"],
		onSelect,
		onSubmit,
	}: Props = $props();

	let query = $state("");
	let userHighlight = $state<string | undefined>(undefined);
	let inputEl = $state<HTMLInputElement | null>(null);

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return products
			.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
			.slice(0, 6);
	});

	// Effective highlight: the user's pick while it's still visible, else the first result.
	const highlighted = $derived.by(() => {
		if (!results.length) return undefined;
		if (userHighlight && results.some((r) => r.name === userHighlight)) return userHighlight;
		return results[0].name;
	});

	$effect(() => {
		if (open) inputEl?.focus();
	});

	function close() {
		open = false;
		query = "";
		userHighlight = undefined;
	}

	function select(product: Product) {
		onSelect?.(product);
		close();
	}

	function submit(q: string) {
		onSubmit?.(q);
		close();
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			close();
			return;
		}
		if (e.key === "Enter") {
			const picked = results.find((r) => r.name === highlighted);
			if (picked) select(picked);
			else if (query.trim()) submit(query.trim());
			return;
		}
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			if (!results.length) return;
			const i = results.findIndex((r) => r.name === highlighted);
			const next = e.key === "ArrowDown" ? Math.min(i + 1, results.length - 1) : Math.max(i - 1, 0);
			userHighlight = results[next].name;
		}
	}
</script>

<!-- Backdrop -->
<button
	type="button"
	aria-label="Close search"
	tabindex={open ? 0 : -1}
	class="fixed inset-0 z-[90] bg-foreground/40 transition-opacity duration-200 {open
		? 'visible opacity-100'
		: 'invisible opacity-0'}"
	onclick={close}
></button>

<!-- Panel -->
<div
	role="dialog"
	aria-label="Search"
	class="fixed inset-x-4 top-[12vh] z-[91] mx-auto w-auto max-w-xl overflow-hidden rounded-xl bg-card text-card-foreground shadow-xl transition-all duration-200 sm:inset-x-6 {open
		? 'visible translate-y-0 opacity-100'
		: 'invisible -translate-y-2 opacity-0'}"
>
	<div class="flex items-center gap-3 border-b border-border px-5">
		<Search size={19} class="flex-none text-muted-foreground" />
		<input
			bind:this={inputEl}
			bind:value={query}
			{placeholder}
			{onkeydown}
			aria-label="Search products"
			class="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/60"
		/>
		<button
			type="button"
			class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			aria-label="Close"
			onclick={close}
		>
			<X size={17} />
		</button>
	</div>

	{#if query.trim() === ""}
		<div class="px-5 py-4">
			<p class="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
				Popular searches
			</p>
			<div class="flex flex-wrap gap-2">
				{#each popular as term (term)}
					<button
						type="button"
						onclick={() => (query = term)}
						class="rounded-full border border-border bg-background px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary"
					>
						{term}
					</button>
				{/each}
			</div>
		</div>
	{:else if results.length === 0}
		<p class="px-5 py-6 text-center text-[15px] text-muted-foreground">
			Nothing for “{query.trim()}” — press Enter to search anyway.
		</p>
	{:else}
		<ul class="max-h-[46vh] overflow-y-auto py-2">
			{#each results as product (product.name)}
				<li>
					<button
						type="button"
						onclick={() => select(product)}
						onmouseenter={() => (userHighlight = product.name)}
						class="flex w-full items-center gap-3.5 px-5 py-2.5 text-left transition-colors {highlighted ===
						product.name
							? 'bg-muted'
							: ''}"
					>
						<div class="h-12 w-10 flex-none overflow-hidden rounded bg-muted">
							{#if product.image}
								<img src={product.image} alt="" class="h-full w-full object-cover" />
							{/if}
						</div>
						<div class="flex-1">
							<div class="text-[15px] font-medium">{product.name}</div>
							<div class="text-[13px] text-muted-foreground/70">{product.category}</div>
						</div>
						<span class="font-medium tabular-nums">{money(product.price)}</span>
					</button>
				</li>
			{/each}
		</ul>
		<p class="border-t border-border px-5 py-2.5 text-xs text-muted-foreground/70">
			↑↓ to navigate · Enter to select · Esc to close
		</p>
	{/if}
</div>
