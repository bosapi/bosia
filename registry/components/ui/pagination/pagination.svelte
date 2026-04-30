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

<nav
	role="navigation"
	aria-label="pagination"
	class={cn("mx-auto flex w-full justify-center", className)}
	{...restProps}
>
	{@render children?.()}
</nav>
