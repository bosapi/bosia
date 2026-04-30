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

<code
	class={cn(
		"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</code>
