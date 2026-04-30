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

	const ctx = getContext<{ errorId: string; error?: string }>("field");
</script>

{#if ctx.error || children}
	<p
		id={ctx.errorId}
		role="alert"
		class={cn("text-destructive text-sm", className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			{ctx.error}
		{/if}
	</p>
{/if}
