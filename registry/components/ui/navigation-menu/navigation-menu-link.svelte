<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		href = "#",
		children,
		...restProps
	}: {
		class?: string;
		href?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<a
	{href}
	class={cn(
		"block select-none rounded-md p-3 leading-none no-underline text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</a>
