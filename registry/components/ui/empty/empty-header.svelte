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
	data-slot="empty-header"
	class={cn("gap-2 flex max-w-sm flex-col items-center", className)}
	{...restProps}
>
	{@render children?.()}
</div>
