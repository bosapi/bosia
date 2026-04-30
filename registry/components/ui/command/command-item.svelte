<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext, untrack } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value,
		keywords = undefined as string[] | undefined,
		onSelect = (_v: string) => {},
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		value: string;
		keywords?: string[];
		onSelect?: (value: string) => void;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const command = getContext<{
		highlightedValue: string | undefined;
		isVisible: (value: string, keywords?: string[]) => boolean;
		register: (item: {
			value: string;
			keywords: string[] | undefined;
			onSelect: (v: string) => void;
		}) => void;
		unregister: (value: string) => void;
		setHighlight: (value: string) => void;
		select: (value: string) => void;
	}>("command");

	const visible = $derived(command.isVisible(value, keywords));
	const highlighted = $derived(command.highlightedValue === value);

	$effect(() => {
		untrack(() => {
			command.register({ value, keywords, onSelect });
		});
		return () => {
			untrack(() => command.unregister(value));
		};
	});

	function handleClick() {
		if (disabled) return;
		command.select(value);
	}

	function onmouseenter() {
		if (disabled) return;
		command.setHighlight(value);
	}
</script>

<div
	role="option"
	aria-selected={highlighted}
	aria-disabled={disabled || undefined}
	data-value={value}
	data-state={highlighted ? "selected" : undefined}
	hidden={!visible || undefined}
	class={cn(
		"relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
		"data-[state=selected]:bg-accent data-[state=selected]:text-accent-foreground",
		disabled && "pointer-events-none opacity-50",
		className,
	)}
	onclick={handleClick}
	{onmouseenter}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{value}
	{/if}
</div>
