<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import { Button } from "$registry/button";
	import type { Snippet } from "svelte";
	import { ArrowRight } from "@lucide/svelte";

	let {
		class: className = "",
		children,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const ctx = getContext<any>("carousel");
</script>

<Button
	data-slot="carousel-next"
	variant="outline"
	size="icon"
	class={cn(
		"absolute z-10",
		ctx.orientation === "horizontal"
			? "-right-12 top-1/2 -translate-y-1/2"
			: "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
		className,
	)}
	disabled={!ctx.canScrollNext}
	onclick={ctx.scrollNext}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<ArrowRight size={16} />
		<span class="sr-only">Next slide</span>
	{/if}
</Button>
