<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		page = 1,
		pageSize = 10,
		totalRows = 0,
		onPageChange,
		class: className = "",
	}: {
		page?: number;
		pageSize?: number;
		totalRows?: number;
		onPageChange?: (page: number) => void;
		class?: string;
	} = $props();

	const totalPages = $derived(Math.ceil(totalRows / pageSize) || 1);
	const startRow = $derived(totalRows === 0 ? 0 : (page - 1) * pageSize + 1);
	const endRow = $derived(Math.min(page * pageSize, totalRows));

	const btnClass = cn(
		"inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm",
		"hover:bg-accent hover:text-accent-foreground",
		"disabled:pointer-events-none disabled:opacity-50",
		"transition-colors",
	);
</script>

<div
	class={cn(
		"flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground",
		className,
	)}
>
	<span>
		{#if totalRows === 0}
			No results
		{:else}
			Showing {startRow}–{endRow} of {totalRows}
		{/if}
	</span>

	<div class="flex items-center gap-3">
		<span>Page {page} of {totalPages}</span>
		<div class="flex gap-1">
			<button
				type="button"
				onclick={() => onPageChange?.(page - 1)}
				disabled={page <= 1}
				class={btnClass}
				aria-label="Previous page"
			>
				‹
			</button>
			<button
				type="button"
				onclick={() => onPageChange?.(page + 1)}
				disabled={page >= totalPages}
				class={btnClass}
				aria-label="Next page"
			>
				›
			</button>
		</div>
	</div>
</div>
