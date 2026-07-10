<script lang="ts">
	import { Star } from "@lucide/svelte";

	interface Item {
		id: string;
		title: string;
		/** Secondary line under the title (e.g. address). */
		meta?: string;
		/** Trailing stat, rendered with a star glyph (e.g. "4.6 · 128 reviews"). */
		stat?: string;
	}

	interface Props {
		items?: Item[];
		selectedIds?: string[];
		onToggle?: (id: string) => void;
		class?: string;
	}

	let {
		items = [
			{ id: "1", title: "Northwind Goods", meta: "12 Elm Street", stat: "4.6 · 128" },
			{ id: "2", title: "Fathom Supply", meta: "48 Dock Road", stat: "4.2 · 87" },
			{ id: "3", title: "Lumen & Co", meta: "3 Market Square", stat: "4.8 · 214" },
		],
		selectedIds = [],
		onToggle,
		class: className = "",
	}: Props = $props();
</script>

<div class="flex flex-col gap-2 {className}">
	{#each items as item (item.id)}
		{@const selected = selectedIds.includes(item.id)}
		<label
			class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors {selected
				? 'border-primary bg-primary/5'
				: 'border-border bg-card hover:bg-muted/40'}"
		>
			<input
				type="checkbox"
				checked={selected}
				onchange={() => onToggle?.(item.id)}
				class="mt-1 h-4 w-4 rounded border-input accent-primary"
			/>
			<span class="min-w-0 flex-1">
				<span class="flex items-baseline justify-between gap-2">
					<span class="truncate text-sm font-semibold">{item.title}</span>
					{#if item.stat}
						<span
							class="flex flex-none items-center gap-1 whitespace-nowrap text-xs text-muted-foreground"
						>
							<Star size={12} class="fill-amber-500 text-amber-500" />
							{item.stat}
						</span>
					{/if}
				</span>
				{#if item.meta}
					<span class="block truncate text-xs text-muted-foreground">{item.meta}</span>
				{/if}
			</span>
		</label>
	{/each}
</div>
