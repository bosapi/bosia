<script lang="ts">
	import { cn } from "$lib/utils.ts";
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
</script>

<div
	data-slot="empty"
	class={cn(
		"gap-4 rounded-lg border border-dashed p-12 flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
