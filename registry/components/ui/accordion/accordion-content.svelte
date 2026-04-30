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

	const item = getContext<{
		value: string;
		disabled: boolean;
		isOpen: boolean;
		dataState: "open" | "closed";
		triggerId: string;
		contentId: string;
		toggle: () => void;
	}>("accordion-item");
</script>

<div
	role="region"
	id={item.contentId}
	aria-labelledby={item.triggerId}
	data-slot="accordion-content"
	data-state={item.dataState}
	hidden={!item.isOpen}
	class="overflow-hidden text-sm"
	{...restProps}
>
	<div class={cn("pb-4 pt-0", className)}>
		{@render children?.()}
	</div>
</div>
