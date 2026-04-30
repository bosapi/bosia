<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext, onDestroy } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		open = $bindable(false),
		openDelay = 700,
		closeDelay = 300,
		children,
		...restProps
	}: {
		class?: string;
		open?: boolean;
		openDelay?: number;
		closeDelay?: number;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const uid = crypto.randomUUID().slice(0, 8);
	const id = `hover-card-${uid}`;

	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function clearTimers() {
		if (showTimer) {
			clearTimeout(showTimer);
			showTimer = null;
		}
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
	}

	function show() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		if (open) return;
		if (openDelay <= 0) {
			open = true;
			return;
		}
		showTimer = setTimeout(() => {
			open = true;
			showTimer = null;
		}, openDelay);
	}

	function hide() {
		if (showTimer) {
			clearTimeout(showTimer);
			showTimer = null;
		}
		if (!open) return;
		if (closeDelay <= 0) {
			open = false;
			return;
		}
		hideTimer = setTimeout(() => {
			open = false;
			hideTimer = null;
		}, closeDelay);
	}

	setContext("hover-card", {
		get open() {
			return open;
		},
		get id() {
			return id;
		},
		show,
		hide,
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && open) {
			clearTimers();
			open = false;
		}
	}

	onDestroy(clearTimers);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class={cn("relative inline-block", className)} data-hover-card {...restProps}>
	{@render children?.()}
</div>
