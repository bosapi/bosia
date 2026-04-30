<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
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

	const command = getContext<{ visibleCount: number }>("command");
</script>

{#if command.visibleCount === 0}
	<div class={cn("py-6 text-center text-sm", className)} {...restProps}>
		{#if children}
			{@render children()}
		{:else}
			No results found.
		{/if}
	</div>
{/if}
