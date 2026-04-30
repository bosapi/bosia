<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	type Side = "top" | "right" | "bottom" | "left";
	type Align = "start" | "center" | "end";

	let {
		class: className = "",
		side = "bottom" as Side,
		align = "center" as Align,
		sideOffset = 4,
		children,
		...restProps
	}: {
		class?: string;
		side?: Side;
		align?: Align;
		sideOffset?: number;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const hoverCard = getContext<{
		open: boolean;
		id: string;
		show: () => void;
		hide: () => void;
	}>("hover-card");

	const sidePosition: Record<Side, string> = {
		top: "bottom-full left-1/2 -translate-x-1/2",
		bottom: "top-full left-1/2 -translate-x-1/2",
		left: "right-full top-1/2 -translate-y-1/2",
		right: "left-full top-1/2 -translate-y-1/2",
	};

	const alignClasses: Record<Side, Record<Align, string>> = {
		top: {
			start: "left-0 translate-x-0",
			center: "",
			end: "left-auto right-0 translate-x-0",
		},
		bottom: {
			start: "left-0 translate-x-0",
			center: "",
			end: "left-auto right-0 translate-x-0",
		},
		left: {
			start: "top-0 translate-y-0",
			center: "",
			end: "top-auto bottom-0 translate-y-0",
		},
		right: {
			start: "top-0 translate-y-0",
			center: "",
			end: "top-auto bottom-0 translate-y-0",
		},
	};

	const offsetStyle = $derived.by(() => {
		switch (side) {
			case "top":
				return `margin-bottom: ${sideOffset}px;`;
			case "bottom":
				return `margin-top: ${sideOffset}px;`;
			case "left":
				return `margin-right: ${sideOffset}px;`;
			case "right":
				return `margin-left: ${sideOffset}px;`;
		}
	});
</script>

{#if hoverCard?.open}
	<div
		id={hoverCard.id}
		role="dialog"
		class={cn(
			"hover-card-content absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
			sidePosition[side],
			alignClasses[side][align],
			className,
		)}
		style={offsetStyle}
		onmouseenter={() => hoverCard?.show()}
		onmouseleave={() => hoverCard?.hide()}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.hover-card-content {
		animation: hover-card-in 0.15s ease-out;
	}

	@keyframes hover-card-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
