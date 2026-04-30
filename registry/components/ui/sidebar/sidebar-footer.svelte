<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";
	import { getSidebarContext } from "./context.ts";

	let {
		class: className = "",
		children,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const sidebar = getSidebarContext();
</script>

<div
	class={cn(
		"mt-auto overflow-hidden transition-[padding] duration-200",
		sidebar.collapsed ? "flex items-center justify-center px-0 py-3" : "px-3 py-3",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
