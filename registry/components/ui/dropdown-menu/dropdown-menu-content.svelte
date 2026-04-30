<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		align = "end" as "start" | "end" | "center",
		children,
		...restProps
	}: {
		class?: string;
		align?: "start" | "end" | "center";
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const dropdown = getContext<{ open: boolean }>("dropdown");

	const alignClasses: Record<string, string> = {
		start: "left-0",
		end: "right-0",
		center: "left-1/2 -translate-x-1/2",
	};
</script>

{#if dropdown?.open}
	<div
		class={cn(
			"dropdown-content absolute top-full mt-2 z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			alignClasses[align],
			className,
		)}
		role="menu"
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.dropdown-content {
		animation: dropdown-in 0.15s ease-out;
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
