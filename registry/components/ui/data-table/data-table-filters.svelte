<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { FilterDef } from "./types.ts";

	let {
		filters = [],
		values = $bindable({}),
		onchange,
	}: {
		filters?: FilterDef[];
		values?: Record<string, string>;
		onchange?: (filterId: string, value: string) => void;
	} = $props();

	let debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

	function handleTextInput(id: string, value: string) {
		clearTimeout(debounceTimers[id]);
		debounceTimers[id] = setTimeout(() => {
			values[id] = value;
			onchange?.(id, value);
		}, 300);
	}

	function handleChange(id: string, value: string) {
		values[id] = value;
		onchange?.(id, value);
	}

	const inputClass = cn(
		"h-8 rounded-md border border-input bg-background px-3 py-1 text-sm",
		"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
	);
</script>

{#if filters.length > 0}
	<div class="flex flex-wrap items-center gap-2 pb-4">
		{#each filters as filter (filter.id)}
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium text-muted-foreground" for="filter-{filter.id}">
					{filter.label}
				</label>
				{#if filter.type === "text"}
					<input
						id="filter-{filter.id}"
						type="text"
						placeholder={filter.placeholder ?? filter.label}
						value={values[filter.id] ?? ""}
						oninput={(e) =>
							handleTextInput(filter.id, (e.currentTarget as HTMLInputElement).value)}
						class={cn(inputClass, "w-48 placeholder:text-muted-foreground")}
					/>
				{:else if filter.type === "select"}
					<select
						id="filter-{filter.id}"
						value={values[filter.id] ?? ""}
						onchange={(e) =>
							handleChange(filter.id, (e.currentTarget as HTMLSelectElement).value)}
						class={cn(inputClass, "w-36")}
					>
						{#each filter.options ?? [] as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				{:else if filter.type === "date"}
					<input
						id="filter-{filter.id}"
						type="date"
						value={values[filter.id] ?? ""}
						onchange={(e) =>
							handleChange(filter.id, (e.currentTarget as HTMLInputElement).value)}
						class={inputClass}
					/>
				{/if}
			</div>
		{/each}
	</div>
{/if}
