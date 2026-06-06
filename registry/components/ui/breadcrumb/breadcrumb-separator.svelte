<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";
	import { ChevronRight } from "@lucide/svelte";

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

<li role="presentation" aria-hidden="true" class={cn("[&>svg]:size-3.5", className)} {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<ChevronRight />
	{/if}
</li>
