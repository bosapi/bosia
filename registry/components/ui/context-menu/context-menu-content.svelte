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

	const ctx = getContext<{
		open: boolean;
		x: number;
		y: number;
		close: () => void;
	}>("context-menu");
</script>

{#if ctx?.open}
	<div
		class={cn(
			"context-menu-content fixed z-50 min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			className,
		)}
		style="left: {ctx.x}px; top: {ctx.y}px;"
		role="menu"
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.context-menu-content {
		animation: context-menu-in 0.15s ease-out;
	}

	@keyframes context-menu-in {
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
