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

<button
	type="button"
	role="menuitem"
	class={cn(
		"relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
		"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</button>
