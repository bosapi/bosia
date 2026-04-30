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

	const sub = getContext<{ isOpen: boolean }>("context-menu-sub");
</script>

{#if sub?.isOpen}
	<div
		class={cn(
			"context-menu-sub-content absolute left-full top-0 z-50 min-w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			className,
		)}
		role="menu"
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.context-menu-sub-content {
		animation: context-menu-sub-in 0.15s ease-out;
	}

	@keyframes context-menu-sub-in {
		from {
			opacity: 0;
			transform: translateX(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
