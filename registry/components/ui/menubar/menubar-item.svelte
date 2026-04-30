<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		onclick,
		children,
		...restProps
	}: {
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const menu = getContext<{ close: () => void }>("menubar-menu");

	function handleClick(e: MouseEvent) {
		menu.close();
		onclick?.(e);
	}
</script>

<button
	type="button"
	role="menuitem"
	class={cn(
		"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
		"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
		className,
	)}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</button>
