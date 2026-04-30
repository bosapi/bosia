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

	let activeMenu = $state<string | null>(null);
	let rootEl: HTMLDivElement;

	setContext("menubar", {
		get activeMenu() {
			return activeMenu;
		},
		setActive(id: string) {
			activeMenu = id;
		},
		close() {
			activeMenu = null;
		},
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") activeMenu = null;
	}

	function handleClickOutside(e: MouseEvent) {
		if (rootEl && !rootEl.contains(e.target as Node)) {
			activeMenu = null;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div
	bind:this={rootEl}
	class={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
	role="menubar"
	data-menubar
	{...restProps}
>
	{@render children?.()}
</div>
