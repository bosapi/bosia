<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
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

	const popover = getContext<{
		open: boolean;
		id: string;
		trigger: "click" | "hover";
		toggle: () => void;
		show: () => void;
		hide: () => void;
	}>("popover");

	const isHover = $derived(popover?.trigger === "hover");
</script>

<button
	type="button"
	class={cn("inline-flex items-center justify-center", className)}
	aria-haspopup="dialog"
	aria-expanded={popover?.open ?? false}
	aria-controls={popover?.id}
	onclick={() => (isHover ? popover?.toggle() : popover?.toggle())}
	onmouseenter={() => {
		if (isHover) popover?.show();
	}}
	onmouseleave={() => {
		if (isHover) popover?.hide();
	}}
	onfocus={() => {
		if (isHover) popover?.show();
	}}
	onblur={() => {
		if (isHover) popover?.hide();
	}}
	ontouchstart={(e) => {
		if (isHover) {
			e.preventDefault();
			popover?.toggle();
		}
	}}
	{...restProps}
>
	{@render children?.()}
</button>
