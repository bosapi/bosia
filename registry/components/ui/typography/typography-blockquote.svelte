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

<blockquote class={cn("mt-6 border-l-2 pl-6 italic", className)} {...restProps}>
	{@render children?.()}
</blockquote>
