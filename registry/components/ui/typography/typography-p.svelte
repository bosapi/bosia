<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		children,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<p class={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...restProps}>
	{@render children?.()}
</p>
