<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		ratio = 16 / 9,
		class: className = "",
		children,
		...restProps
	}: {
		ratio?: number;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<div
	class={cn("relative w-full", className)}
	style="padding-bottom: {(1 / ratio) * 100}%;"
	{...restProps}
>
	<div class="absolute inset-0">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
