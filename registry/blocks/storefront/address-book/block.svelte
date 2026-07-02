<script lang="ts">
	import { Plus, Pencil, Trash2 } from "@lucide/svelte";
	import { sampleAddresses, type Address } from "$lib/blocks/storefront/store/orders.ts";

	interface Props {
		addresses?: Address[];
		onAdd?: () => void;
		onEdit?: (address: Address) => void;
		onRemove?: (address: Address) => void;
	}

	let { addresses = sampleAddresses, onAdd, onEdit, onRemove }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2">
	{#each addresses as address (address.label)}
		<div class="flex flex-col rounded-xl border border-border bg-card p-5">
			<div class="mb-2.5 flex items-center justify-between">
				<span class="text-[15px] font-semibold">{address.label}</span>
				{#if address.default}
					<span
						class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary"
					>
						Default
					</span>
				{/if}
			</div>
			<p class="flex-1 text-[15px] leading-relaxed text-muted-foreground">
				{address.name}<br />
				{address.line1}<br />
				{address.city}
				{address.zip}<br />
				{address.country}
			</p>
			<div class="mt-4 flex gap-2">
				<button
					type="button"
					onclick={() => onEdit?.(address)}
					class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-semibold transition hover:bg-muted"
				>
					<Pencil size={14} /> Edit
				</button>
				<button
					type="button"
					onclick={() => onRemove?.(address)}
					class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-destructive"
				>
					<Trash2 size={14} /> Remove
				</button>
			</div>
		</div>
	{/each}

	<button
		type="button"
		onclick={onAdd}
		class="grid min-h-[180px] place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
	>
		<span class="flex flex-col items-center gap-2 text-[15px] font-medium">
			<Plus size={22} />
			Add address
		</span>
	</button>
</div>
