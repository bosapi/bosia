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

	const nav = getContext<{
		value: string | null;
		open: (id: string) => void;
		scheduleClose: (id: string) => void;
		cancelClose: () => void;
		closeAll: () => void;
	}>("navigation-menu");

	const item = getContext<{ id: string }>("navigation-menu-item");
	const id = item?.id ?? "";

	const isOpen = $derived(nav?.value === id);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			nav?.closeAll();
			const trigger = document.getElementById(`${id}-trigger`);
			trigger?.focus();
		}
	}
</script>

{#if isOpen}
	<div
		id={`${id}-content`}
		aria-labelledby={`${id}-trigger`}
		data-state="open"
		class={cn(
			"navigation-menu-content absolute left-0 top-full mt-1.5 z-50 w-max rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
			className,
		)}
		onmouseenter={() => nav?.cancelClose()}
		onmouseleave={() => nav?.scheduleClose(id)}
		onkeydown={handleKeydown}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.navigation-menu-content {
		animation: navigation-menu-in 0.15s ease-out;
	}

	@keyframes navigation-menu-in {
		from {
			opacity: 0;
			transform: scale(0.97) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
