<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import PaginationLink from "./pagination-link.svelte";
	import { ChevronLeft } from "@lucide/svelte";

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
	aria-label="Go to previous page"
	class={cn("gap-1 pl-2.5", className)}
	{...restProps}
>
	<ChevronLeft class="h-4 w-4" />
	<span>Previous</span>
</PaginationLink>
