<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext, onDestroy } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		open = $bindable(false),
		trigger = "click" as "click" | "hover",
		closeDelay = 150,
		children,
		...restProps
	}: {
		class?: string;
		open?: boolean;
		trigger?: "click" | "hover";
		closeDelay?: number;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const uid = crypto.randomUUID().slice(0, 8);
	const id = `popover-${uid}`;

	let rootEl: HTMLDivElement;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	function show() {
		clearTimeout(closeTimer);
		open = true;
	}

	function hide() {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => {
			open = false;
		}, closeDelay);
	}

	onDestroy(() => clearTimeout(closeTimer));

	setContext("popover", {
		get open() {
			return open;
		},
		get id() {
			return id;
		},
		get trigger() {
			return trigger;
		},
		toggle() {
			open = !open;
		},
		close() {
			open = false;
		},
		show,
		hide,
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && open) open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		if (trigger !== "click") return;
		if (rootEl && !rootEl.contains(e.target as Node)) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div bind:this={rootEl} class={cn("relative inline-block", className)} data-popover {...restProps}>
	{@render children?.()}
</div>
