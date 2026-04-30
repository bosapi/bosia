<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";
	import { getSidebarContext } from "./context.ts";

	let {
		class: className = "",
		label = "",
		children,
		...restProps
	}: {
		class?: string;
		label?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const sidebar = getSidebarContext();
</script>

<div class={cn("px-2 py-2", className)} {...restProps}>
	{#if label}
		<h4
			class={cn(
				"mb-1 truncate px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200",
				sidebar.collapsed && "pointer-events-none h-0 overflow-hidden opacity-0 mb-0",
			)}
		>
			{label}
		</h4>
	{/if}
	{@render children?.()}
</div>
