<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		align = "start" as "start" | "end" | "center",
		children,
		...restProps
	}: {
		class?: string;
		align?: "start" | "end" | "center";
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const select = getContext<{ open: boolean }>("select");

	const alignClasses: Record<string, string> = {
		start: "left-0",
		end: "right-0",
		center: "left-1/2 -translate-x-1/2",
	};

	function onkeydown(e: KeyboardEvent) {
		const el = e.currentTarget as HTMLDivElement;
		const items = Array.from(
			el.querySelectorAll<HTMLDivElement>("[role='option']:not([aria-disabled='true'])"),
		);
		if (!items.length) return;

		const focused = el.querySelector<HTMLDivElement>("[role='option']:focus");
		const index = focused ? items.indexOf(focused) : -1;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			const next = index < items.length - 1 ? index + 1 : 0;
			items[next].focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			const prev = index > 0 ? index - 1 : items.length - 1;
			items[prev].focus();
		}
	}
</script>

{#if select?.open}
	<div
		class={cn(
			"select-content absolute top-full mt-1 z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			alignClasses[align],
			className,
		)}
		role="listbox"
		{onkeydown}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.select-content {
		animation: select-in 0.15s ease-out;
	}

	@keyframes select-in {
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
