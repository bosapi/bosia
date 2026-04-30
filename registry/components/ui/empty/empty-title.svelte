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

<h3
	data-slot="empty-title"
	class={cn("text-lg font-medium tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</h3>
