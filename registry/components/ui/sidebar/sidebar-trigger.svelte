<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		class: className = "",
		collapsed = false,
		...restProps
	}: {
		class?: string;
		collapsed?: boolean;
		[key: string]: any;
	} = $props();
</script>

<button
	class={cn(
		"inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
		className,
	)}
	aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
	{...restProps}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<rect width="18" height="18" x="3" y="3" rx="2" />
		<path d="M9 3v18" />
	</svg>
</button>
