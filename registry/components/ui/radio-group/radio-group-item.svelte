<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";

	let {
		value,
		id = undefined as string | undefined,
		disabled = false,
		class: className = "",
		...restProps
	}: {
		value: string;
		id?: string;
		disabled?: boolean;
		class?: string;
		[key: string]: any;
	} = $props();

	const group = getContext<{
		value: string | undefined;
		name: string | undefined;
		disabled: boolean;
		select: (value: string) => void;
	}>("radio-group");

	const isChecked = $derived(group.value === value);
	const isDisabled = $derived(disabled || group.disabled);
	const dataState = $derived(isChecked ? "checked" : "unchecked");

	function select() {
		if (isDisabled) return;
		group.select(value);
	}

	function onkeydown(e: KeyboardEvent) {
		const current = e.currentTarget as HTMLButtonElement;
		const root = current.closest("[role='radiogroup']");
		if (!root) return;
		const items = Array.from(root.querySelectorAll<HTMLButtonElement>("[role='radio']"));
		const index = items.indexOf(current);
		let next: HTMLButtonElement | undefined;

		if (e.key === "ArrowDown" || e.key === "ArrowRight") {
			e.preventDefault();
			next = findNextEnabled(items, index, 1);
		} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
			e.preventDefault();
			next = findNextEnabled(items, index, -1);
		} else if (e.key === " ") {
			e.preventDefault();
			select();
			return;
		}

		if (next) {
			next.focus();
			if (!next.disabled) {
				group.select(next.dataset.value!);
			}
		}
	}

	function findNextEnabled(
		items: HTMLButtonElement[],
		current: number,
		direction: number,
	): HTMLButtonElement | undefined {
		const len = items.length;
		for (let i = 1; i <= len; i++) {
			const idx = (current + i * direction + len) % len;
			if (!items[idx].disabled) return items[idx];
		}
		return undefined;
	}
</script>

<button
	type="button"
	role="radio"
	aria-checked={isChecked}
	data-state={dataState}
	data-value={value}
	disabled={isDisabled}
	{id}
	tabindex={isChecked ? 0 : -1}
	class={cn(
		"aspect-square size-4 rounded-full border border-primary text-primary",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	onclick={select}
	{onkeydown}
	{...restProps}
>
	{#if isChecked}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			class="size-full p-px"
		>
			<circle cx="12" cy="12" r="6" />
		</svg>
	{/if}
</button>

{#if group.name}
	<input
		type="radio"
		name={group.name}
		{value}
		checked={isChecked}
		disabled={isDisabled}
		tabindex="-1"
		aria-hidden="true"
		class="sr-only"
	/>
{/if}
