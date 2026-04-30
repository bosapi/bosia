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

	const tooltip = getContext<{
		open: boolean;
		id: string;
		show: () => void;
		hide: () => void;
	}>("tooltip");
</script>

<button
	type="button"
	class={cn("inline-flex items-center justify-center", className)}
	aria-describedby={tooltip?.open ? tooltip.id : undefined}
	onmouseenter={() => tooltip?.show()}
	onmouseleave={() => tooltip?.hide()}
	onfocus={() => tooltip?.show()}
	onblur={() => tooltip?.hide()}
	{...restProps}
>
	{@render children?.()}
</button>
