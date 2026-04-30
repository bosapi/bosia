<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		src = undefined as string | undefined,
		alt = "",
		children,
		...restProps
	}: {
		class?: string;
		src?: string;
		alt?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let imgError = $state(false);
</script>

<span
	class={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
	{...restProps}
>
	{#if src && !imgError}
		<img {src} {alt} class="aspect-square h-full w-full" onerror={() => (imgError = true)} />
	{:else if children}
		{@render children()}
	{/if}
</span>
