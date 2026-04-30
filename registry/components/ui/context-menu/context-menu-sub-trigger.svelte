<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		disabled = false,
		children,
		...restProps
	}: {
		class?: string;
		disabled?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const sub = getContext<{ isOpen: boolean; open: () => void }>("context-menu-sub");
</script>

<button
	type="button"
	role="menuitem"
	aria-haspopup="menu"
	aria-expanded={sub.isOpen}
	{disabled}
	class={cn(
		"relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
		"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
		sub.isOpen && "bg-accent text-accent-foreground",
		disabled && "pointer-events-none opacity-50",
		className,
	)}
	onclick={() => sub.open()}
	{...restProps}
>
	{@render children?.()}
	<span class="ml-auto">›</span>
</button>
