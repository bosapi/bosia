<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";
	import { setSidebarContext } from "./context.ts";

	let {
		class: className = "",
		side = "left" as "left" | "right",
		collapsible = "icon" as "icon" | "none",
		collapsed = $bindable(false),
		children,
		...restProps
	}: {
		class?: string;
		side?: "left" | "right";
		collapsible?: "icon" | "none";
		collapsed?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	function toggle() {
		if (collapsible === "none") return;
		collapsed = !collapsed;
	}

	setSidebarContext({
		get collapsed() {
			return collapsed;
		},
		toggle,
	});
</script>

<aside
	class={cn(
		"relative flex flex-col border-r bg-sidebar text-sidebar-foreground overflow-hidden transition-[width] duration-200 ease-in-out",
		side === "right" && "order-last border-l border-r-0",
		collapsed ? "w-[var(--sidebar-width-icon,3rem)]" : "w-[var(--sidebar-width,16rem)]",
		className,
	)}
	data-collapsed={collapsed}
	{...restProps}
>
	{@render children?.()}
</aside>
