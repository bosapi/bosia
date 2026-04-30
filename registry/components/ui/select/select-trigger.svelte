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

	const select = getContext<{
		open: boolean;
		disabled: boolean;
		toggle: () => void;
	}>("select");

	function onkeydown(e: KeyboardEvent) {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			if (!select.open) select.toggle();
		}
	}
</script>

<button
	type="button"
	role="combobox"
	aria-haspopup="listbox"
	aria-expanded={select.open}
	disabled={select.disabled}
	class={cn(
		"flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
		"placeholder:text-muted-foreground",
		"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	onclick={() => select.toggle()}
	{onkeydown}
	{...restProps}
>
	{@render children?.()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="size-4 shrink-0 opacity-50"
		aria-hidden="true"
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
</button>
