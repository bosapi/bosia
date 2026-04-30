<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		checked = $bindable(false),
		disabled = false,
		id = undefined as string | undefined,
		name = undefined as string | undefined,
		value = undefined as string | undefined,
		class: className = "",
		...restProps
	}: {
		checked?: boolean;
		disabled?: boolean;
		id?: string;
		name?: string;
		value?: string;
		class?: string;
		[key: string]: any;
	} = $props();

	const dataState = $derived(checked ? "checked" : "unchecked");

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
	role="switch"
	aria-checked={checked}
	data-state={dataState}
	{disabled}
	{id}
	class={cn(
		"peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:cursor-not-allowed disabled:opacity-50",
		"data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
		className,
	)}
	onclick={toggle}
	{onkeydown}
	{...restProps}
>
	<span
		data-state={dataState}
		class={cn(
			"pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
			"data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
		)}
	></span>
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
