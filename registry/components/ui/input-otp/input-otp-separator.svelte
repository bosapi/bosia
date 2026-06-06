<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";
	import { Minus } from "@lucide/svelte";

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

<div
	role="separator"
	class={cn("flex items-center text-muted-foreground", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<Minus size={10} aria-hidden="true" />
	{/if}
</div>
