<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value,
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		value: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const tabs = getContext<{
		value: string;
		setValue: (v: string) => void;
		baseId: string;
	}>("tabs");

	const isSelected = $derived(tabs.value === value);
	const dataState = $derived(isSelected ? "active" : "inactive");
	const triggerId = $derived(`${tabs.baseId}-trigger-${value}`);
	const contentId = $derived(`${tabs.baseId}-content-${value}`);

	function onclick() {
		if (disabled) return;
		tabs.setValue(value);
	}

	function onkeydown(e: KeyboardEvent) {
		const current = e.currentTarget as HTMLButtonElement;
		const list = current.closest("[role='tablist']");
		if (!list) return;
		const items = Array.from(list.querySelectorAll<HTMLButtonElement>("button[role='tab']"));
		const index = items.indexOf(current);
		let next: HTMLButtonElement | undefined;

		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			next = findNextEnabled(items, index, 1);
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			next = findNextEnabled(items, index, -1);
		} else if (e.key === "Home") {
			e.preventDefault();
			next = findNextEnabled(items, -1, 1);
		} else if (e.key === "End") {
			e.preventDefault();
			next = findNextEnabled(items, items.length, -1);
		}

		if (next) {
			next.focus();
			next.click();
		}
	}

	function findNextEnabled(
		items: HTMLButtonElement[],
		current: number,
		direction: number,
	): HTMLButtonElement | undefined {
		const len = items.length;
		for (let i = 1; i <= len; i++) {
			const idx = (current + i * direction + len) % len;
			if (!items[idx].disabled) return items[idx];
		}
		return undefined;
	}
</script>

<button
	type="button"
	role="tab"
	id={triggerId}
	aria-selected={isSelected}
	aria-controls={contentId}
	data-state={dataState}
	data-value={value}
	{disabled}
	tabindex={isSelected ? 0 : -1}
	class={cn(
		"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
		className,
	)}
	{onclick}
	{onkeydown}
	{...restProps}
>
	{@render children?.()}
</button>
