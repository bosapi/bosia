<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext, onDestroy } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		value = $bindable(null),
		openDelay = 150,
		closeDelay = 200,
		children,
		...restProps
	}: {
		class?: string;
		value?: string | null;
		openDelay?: number;
		closeDelay?: number;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let rootEl: HTMLElement;
	let openTimer: ReturnType<typeof setTimeout> | null = null;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingOpenId: string | null = null;

	function clearOpenTimer() {
		if (openTimer) {
			clearTimeout(openTimer);
			openTimer = null;
			pendingOpenId = null;
		}
	}

	function clearCloseTimer() {
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
	}

	function open(id: string) {
		clearCloseTimer();
		if (value === id) return;
		// If another panel is already open, switch instantly.
		if (value !== null) {
			clearOpenTimer();
			value = id;
			return;
		}
		// First-open: delay by openDelay.
		if (pendingOpenId === id) return;
		clearOpenTimer();
		pendingOpenId = id;
		openTimer = setTimeout(() => {
			value = id;
			openTimer = null;
			pendingOpenId = null;
		}, openDelay);
	}

	function scheduleClose(id: string) {
		// If this id is still pending to open, cancel the open.
		if (pendingOpenId === id) clearOpenTimer();
		clearCloseTimer();
		closeTimer = setTimeout(() => {
			if (value === id) value = null;
			closeTimer = null;
		}, closeDelay);
	}

	function cancelClose() {
		clearCloseTimer();
	}

	function closeAll() {
		clearOpenTimer();
		clearCloseTimer();
		value = null;
	}

	function setValue(v: string | null) {
		clearOpenTimer();
		clearCloseTimer();
		value = v;
	}

	setContext("navigation-menu", {
		get value() {
			return value;
		},
		open,
		scheduleClose,
		cancelClose,
		closeAll,
		setValue,
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && value !== null) closeAll();
	}

	function handleClickOutside(e: MouseEvent) {
		if (rootEl && !rootEl.contains(e.target as Node)) closeAll();
	}

	onDestroy(() => {
		clearOpenTimer();
		clearCloseTimer();
	});
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<nav
	bind:this={rootEl}
	aria-label="Main"
	class={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
	data-navigation-menu
	{...restProps}
>
	{@render children?.()}
</nav>
