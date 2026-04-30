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
	role="link"
	aria-disabled="true"
	aria-current="page"
	class={cn("text-foreground font-normal", className)}
	{...restProps}
>
	{@render children?.()}
</span>
