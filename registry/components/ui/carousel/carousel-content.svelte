<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext, onMount } from "svelte";
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

	const ctx = getContext<any>("carousel");
	let viewportEl: HTMLElement;

	onMount(() => {
		ctx.registerViewport(viewportEl);
	});
</script>

<div data-slot="carousel-content" class="overflow-hidden">
	<div
		bind:this={viewportEl}
		onscroll={ctx.updateScrollState}
		class={cn(
			"flex snap-mandatory",
			ctx.orientation === "horizontal"
				? "snap-x -ml-4 flex-row overflow-x-auto"
				: "snap-y -mt-4 flex-col overflow-y-auto",
			"scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
			className,
		)}
		{...restProps}
	>
		{@render children?.()}
	</div>
</div>
