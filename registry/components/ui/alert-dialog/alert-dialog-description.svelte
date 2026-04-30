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

	const dialog = getContext<{ descriptionId: string }>("alert-dialog");
</script>

<p id={dialog?.descriptionId} class={cn("text-sm text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</p>
