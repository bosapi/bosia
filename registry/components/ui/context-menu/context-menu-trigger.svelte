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

	const ctx = getContext<{
		open: boolean;
		openAt: (x: number, y: number) => void;
		close: () => void;
	}>("context-menu");
</script>

<div
	class={cn("", className)}
	onclick={() => {
		if (ctx.open) ctx.close();
	}}
	oncontextmenu={(e) => {
		e.preventDefault();
		ctx.openAt(e.clientX, e.clientY);
	}}
	{...restProps}
>
	{@render children?.()}
</div>
