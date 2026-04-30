<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	type Align = "inline-start" | "inline-end" | "block-start" | "block-end";

	let {
		align = "inline-start" as Align,
		class: className = "",
		children,
		...restProps
	}: {
		align?: Align;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const alignClasses: Record<Align, string> = {
		"inline-start": "order-first pl-2.5 pr-0",
		"inline-end": "order-last pl-0 pr-2.5",
		"block-start": "order-first w-full px-3 pt-2",
		"block-end": "order-last w-full px-3 pb-2",
	};
</script>

<div
	data-slot="input-group-addon"
	data-align={align}
	class={cn(
		"flex items-center gap-2 text-sm font-medium text-muted-foreground",
		alignClasses[align],
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
