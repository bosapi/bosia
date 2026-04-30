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

<h1
	class={cn("scroll-m-20 text-4xl font-extrabold tracking-tight text-balance", className)}
	{...restProps}
>
	{@render children?.()}
</h1>
