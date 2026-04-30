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
	role="listbox"
	class={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-1", className)}
	{...restProps}
>
	{@render children?.()}
</div>
