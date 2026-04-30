<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import PaginationLink from "./pagination-link.svelte";

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
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-4 w-4"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
</PaginationLink>
