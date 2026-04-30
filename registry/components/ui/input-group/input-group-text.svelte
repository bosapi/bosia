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
	data-slot="input-group-text"
	class={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</span>
