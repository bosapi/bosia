<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext, untrack } from "svelte";
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

	const ctx = getContext<{
		direction: "horizontal" | "vertical";
		sizes: number[];
		registerPane(): number;
		unregisterPane(index: number): void;
	}>("resizable");

	let index = $state(-1);

	$effect(() => {
		index = untrack(() => ctx.registerPane());
		return () => untrack(() => ctx.unregisterPane(index));
	});

	const size = $derived(index >= 0 ? (ctx.sizes[index] ?? 0) : 0);
</script>

<div
	data-slot="resizable-pane"
	style="flex: 0 0 {size}%; overflow: hidden"
	class={cn("", className)}
	{...restProps}
>
	{@render children?.()}
</div>
