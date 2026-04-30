<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		open = $bindable(false),
		children,
		...restProps
	}: {
		class?: string;
		open?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let rootEl: HTMLDivElement;

	setContext("dropdown", {
		get open() {
			return open;
		},
		toggle() {
			open = !open;
		},
		close() {
			open = false;
		},
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		if (rootEl && !rootEl.contains(e.target as Node)) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div
	bind:this={rootEl}
	class={cn("relative inline-block", className)}
	data-dropdown-menu
	{...restProps}
>
	{@render children?.()}
</div>
