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

<span
	class={cn(
		"flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</span>
