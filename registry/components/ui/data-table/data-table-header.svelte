<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { ColumnDef, SortState, RenderDescriptor } from "./types.ts";
	import { TableHeader, TableRow, TableHead } from "../table";

	let {
		columns = [],
		sort = null,
		onSortChange,
	}: {
		columns?: ColumnDef<any>[];
		sort?: SortState;
		onSortChange?: (sort: SortState) => void;
	} = $props();

	function handleSort(col: ColumnDef<any>) {
		if (col.enableSorting === false) return;

		if (sort?.id === col.id) {
			onSortChange?.(sort.desc ? null : { id: col.id, desc: true });
		} else {
			onSortChange?.({ id: col.id, desc: false });
		}
	}

	function getSortIcon(col: ColumnDef<any>): string {
		if (sort?.id !== col.id) return "⇅";
		return sort.desc ? "↓" : "↑";
	}

	function isSortable(col: ColumnDef<any>): boolean {
		return col.enableSorting !== false;
	}

	function resolveHeader(
		col: ColumnDef<any>,
	): { text: string } | { descriptor: RenderDescriptor } {
		if (typeof col.header === "string") return { text: col.header };
		return {
			descriptor: col.header({
				column: col,
				sorted: sort?.id === col.id ? (sort.desc ? "desc" : "asc") : false,
			}),
		};
	}
</script>

<TableHeader>
	<TableRow>
		{#each columns as col (col.id)}
			{@const resolved = resolveHeader(col)}
			<TableHead
				class={cn(
					"px-4 text-sm",
					isSortable(col) && "cursor-pointer select-none",
					col.headerClass,
				)}
				onclick={() => isSortable(col) && handleSort(col)}
			>
				<div class="flex items-center gap-1">
					{#if "text" in resolved}
						<span>{resolved.text}</span>
					{:else if resolved.descriptor.type === "snippet"}
						{@render resolved.descriptor.snippet()}
					{:else}
						<svelte:component
							this={resolved.descriptor.component}
							{...resolved.descriptor.props}
						/>
					{/if}
					{#if isSortable(col)}
						<span
							class={cn(
								"text-xs",
								sort?.id === col.id
									? "text-foreground"
									: "text-muted-foreground/50",
							)}
						>
							{getSortIcon(col)}
						</span>
					{/if}
				</div>
			</TableHead>
		{/each}
	</TableRow>
</TableHeader>
