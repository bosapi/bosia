<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value,
		class: className = "",
		children,
		...restProps
	}: {
		value: string;
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
	const triggerId = $derived(`${tabs.baseId}-trigger-${value}`);
	const contentId = $derived(`${tabs.baseId}-content-${value}`);
</script>

<div
	role="tabpanel"
	id={contentId}
	aria-labelledby={triggerId}
	tabindex={0}
	hidden={!isSelected}
	data-state={isSelected ? "active" : "inactive"}
	class={cn(
		"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
