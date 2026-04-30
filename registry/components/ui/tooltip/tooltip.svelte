<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext, onDestroy } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		open = $bindable(false),
		delayDuration = 700,
		children,
		...restProps
	}: {
		class?: string;
		open?: boolean;
		delayDuration?: number;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const uid = crypto.randomUUID().slice(0, 8);
	const id = `tooltip-${uid}`;

	let showTimer: ReturnType<typeof setTimeout> | null = null;

	function clearTimer() {
		if (showTimer) {
			clearTimeout(showTimer);
			showTimer = null;
		}
	}

	function show() {
		clearTimer();
		if (open) return;
		if (delayDuration <= 0) {
			open = true;
			return;
		}
		showTimer = setTimeout(() => {
			open = true;
			showTimer = null;
		}, delayDuration);
	}

	function hide() {
		clearTimer();
		open = false;
	}

	setContext("tooltip", {
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
		if (e.key === "Escape" && open) hide();
	}

	onDestroy(clearTimer);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class={cn("relative inline-block", className)} {...restProps}>
	{@render children?.()}
</div>
