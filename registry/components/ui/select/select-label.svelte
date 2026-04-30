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
	class={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</div>
