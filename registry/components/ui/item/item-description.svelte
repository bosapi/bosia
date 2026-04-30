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

<p class={cn("text-sm text-muted-foreground line-clamp-2", className)} {...restProps}>
	{@render children?.()}
</p>
