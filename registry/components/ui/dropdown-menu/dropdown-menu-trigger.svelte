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

	const dropdown = getContext<{ toggle: () => void }>("dropdown");
</script>

<button
	type="button"
	class={cn(
		"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		className,
	)}
	onclick={() => dropdown?.toggle()}
	{...restProps}
>
	{@render children?.()}
</button>
