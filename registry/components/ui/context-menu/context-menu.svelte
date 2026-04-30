<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
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

	let open = $state(false);
	let x = $state(0);
	let y = $state(0);
	let rootEl: HTMLDivElement;

	setContext("context-menu", {
		get open() {
			return open;
		},
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		openAt(cx: number, cy: number) {
			x = cx;
			y = cy;
			open = true;
		},
		close() {
			open = false;
		},
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && open) {
			open = false;
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (open && rootEl && !rootEl.contains(e.target as Node)) {
			open = false;
		}
	}

	function handleContextMenuOutside(e: MouseEvent) {
		if (open && rootEl && !rootEl.contains(e.target as Node)) {
			open = false;
		}
	}
</script>

<svelte:window
	onclick={handleClickOutside}
	onkeydown={handleKeydown}
	oncontextmenu={handleContextMenuOutside}
/>

<div bind:this={rootEl} class={cn("", className)} data-context-menu {...restProps}>
	{@render children?.()}
</div>
