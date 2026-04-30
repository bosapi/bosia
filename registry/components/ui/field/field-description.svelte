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

	const ctx = getContext<{ descriptionId: string }>("field");
</script>

<p id={ctx.descriptionId} class={cn("text-muted-foreground text-sm", className)} {...restProps}>
	{@render children?.()}
</p>
