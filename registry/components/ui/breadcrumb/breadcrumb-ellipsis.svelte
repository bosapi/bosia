<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		class: className = "",
		...restProps
	}: {
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<span
	role="presentation"
	aria-hidden="true"
	class={cn("flex size-9 items-center justify-center", className)}
	{...restProps}
>
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
		class="size-4"
	>
		<circle cx="12" cy="12" r="1" />
		<circle cx="19" cy="12" r="1" />
		<circle cx="5" cy="12" r="1" />
	</svg>
	<span class="sr-only">More</span>
</span>
