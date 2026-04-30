<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		open?: boolean;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const baseId = `collapsible-${Math.random().toString(36).slice(2, 10)}`;

	function toggle() {
		if (disabled) return;
		open = !open;
	}

	setContext("collapsible", {
		get open() {
			return open;
		},
		get disabled() {
			return disabled;
		},
		get dataState() {
			return open ? "open" : ("closed" as const);
		},
		baseId,
		toggle,
	});
</script>

<div
	data-state={open ? "open" : "closed"}
	data-disabled={disabled || undefined}
	data-slot="collapsible"
	class={cn(className)}
	{...restProps}
>
	{@render children?.()}
</div>
