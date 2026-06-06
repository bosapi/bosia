<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import PaginationLink from "./pagination-link.svelte";
	import { ChevronRight } from "@lucide/svelte";

	let {
		href = "#",
		disabled = false,
		class: className = "",
		...restProps
	}: {
		href?: string;
		disabled?: boolean;
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<PaginationLink
	{href}
	{disabled}
	size="default"
	aria-label="Go to next page"
	class={cn("gap-1 pr-2.5", className)}
	{...restProps}
>
	<span>Next</span>
	<ChevronRight class="h-4 w-4" />
</PaginationLink>
