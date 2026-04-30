<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		href = "#",
		class: className = "",
		children,
		...restProps
	}: {
		href?: string;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<a {href} class={cn("hover:text-foreground transition-colors", className)} {...restProps}>
	{@render children?.()}
</a>
