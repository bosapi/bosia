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

<ul class={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...restProps}>
	{@render children?.()}
</ul>
