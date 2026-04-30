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

<h2
	class={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</h2>
