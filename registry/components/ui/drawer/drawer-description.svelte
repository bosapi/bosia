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

	const drawer = getContext<{ descriptionId: string }>("drawer");
</script>

<p id={drawer?.descriptionId} class={cn("text-sm text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</p>
