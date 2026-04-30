<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(undefined as string | undefined),
		name = undefined as string | undefined,
		disabled = false,
		required = false,
		class: className = "",
		children,
		...restProps
	}: {
		value?: string;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let open = $state(false);
	let selectedLabel = $state("");
	let rootEl: HTMLDivElement;

	setContext("select", {
		get open() {
			return open;
		},
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get name() {
			return name;
		},
		get selectedLabel() {
			return selectedLabel;
		},
		toggle() {
			if (!disabled) open = !open;
		},
		close() {
			open = false;
		},
		select(newValue: string, label: string) {
			value = newValue;
			selectedLabel = label;
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

<div bind:this={rootEl} class={cn("relative inline-block", className)} data-select {...restProps}>
	{@render children?.()}
	{#if name}
		<input type="hidden" {name} value={value ?? ""} aria-hidden="true" />
	{/if}
</div>
