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
	data-slot="empty-content"
	class={cn(
		"gap-4 text-sm flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
