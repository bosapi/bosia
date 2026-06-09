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

	const drawer = getContext<{ titleId: string }>("drawer");
</script>

<h2
	id={drawer?.titleId}
	class={cn("text-lg font-semibold leading-none tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</h2>
