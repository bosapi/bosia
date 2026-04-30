<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value,
		label = undefined as string | undefined,
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		value: string;
		label?: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const select = getContext<{
		value: string | undefined;
		select: (value: string, label: string) => void;
	}>("select");

	const isSelected = $derived(select.value === value);
	const dataState = $derived(isSelected ? "checked" : "unchecked");

	function handleSelect() {
		if (disabled) return;
		select.select(value, label ?? value);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleSelect();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="option"
	aria-selected={isSelected}
	aria-disabled={disabled || undefined}
	data-state={dataState}
	data-value={value}
	tabindex={disabled ? -1 : 0}
	class={cn(
		"relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
		"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
		disabled && "pointer-events-none opacity-50",
		className,
	)}
	onclick={handleSelect}
	{onkeydown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{label ?? value}
	{/if}
	{#if isSelected}
		<span class="absolute right-2 flex size-3.5 items-center justify-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-4"
				aria-hidden="true"
			>
				<path d="M20 6 9 17l-5-5" />
			</svg>
		</span>
	{/if}
</div>
