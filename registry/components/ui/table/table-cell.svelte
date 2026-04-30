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

<td
	class={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
	{...restProps}
>
	{@render children?.()}
</td>
