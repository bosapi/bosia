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

	const menu = getContext<{
		isOpen: boolean;
		toggle: () => void;
		open: () => void;
		hasActiveMenu: boolean;
	}>("menubar-menu");
</script>

<button
	type="button"
	class={cn(
		"flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none",
		"focus-visible:bg-accent focus-visible:text-accent-foreground",
		menu.isOpen && "bg-accent text-accent-foreground",
		className,
	)}
	aria-haspopup="menu"
	aria-expanded={menu.isOpen}
	onclick={() => menu.toggle()}
	onmouseenter={() => {
		if (menu.hasActiveMenu) menu.open();
	}}
	{...restProps}
>
	{@render children?.()}
</button>
