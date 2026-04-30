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

<div
	role="group"
	data-slot="input-group"
	class={cn(
		"relative flex w-full min-w-0 flex-wrap items-stretch rounded-md border border-input bg-background text-sm transition-colors",
		"focus-within:border-primary",
		"has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive",
		"has-[>textarea]:items-stretch",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
