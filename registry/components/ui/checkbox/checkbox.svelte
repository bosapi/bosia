<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { Check, Minus } from "@lucide/svelte";

	let {
		checked = $bindable(false),
		indeterminate = false,
		disabled = false,
		id = undefined as string | undefined,
		name = undefined as string | undefined,
		value = undefined as string | undefined,
		class: className = "",
		...restProps
	}: {
		checked?: boolean;
		indeterminate?: boolean;
		disabled?: boolean;
		id?: string;
		name?: string;
		value?: string;
		class?: string;
		[key: string]: any;
	} = $props();

	const dataState = $derived(indeterminate ? "indeterminate" : checked ? "checked" : "unchecked");

	function toggle() {
		if (disabled) return;
		checked = !checked;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === " ") {
			e.preventDefault();
			toggle();
		}
	}
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={indeterminate ? "mixed" : checked}
	data-state={dataState}
	{disabled}
	{id}
	class={cn(
		"peer size-4 shrink-0 rounded-sm border border-primary",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:cursor-not-allowed disabled:opacity-50",
		"data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
		"data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
		className,
	)}
	onclick={toggle}
	{onkeydown}
	{...restProps}
>
	{#if indeterminate}
		<Minus class="size-full p-px" strokeWidth={3} />
	{:else if checked}
		<Check class="size-full p-px" strokeWidth={3} />
	{/if}
</button>

{#if name}
	<input
		type="checkbox"
		{name}
		{value}
		{checked}
		{disabled}
		tabindex="-1"
		aria-hidden="true"
		class="sr-only"
	/>
{/if}
