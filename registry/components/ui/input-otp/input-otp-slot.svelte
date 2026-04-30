<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";

	let {
		index,
		class: className = "",
		...restProps
	}: {
		index: number;
		class?: string;
		[key: string]: any;
	} = $props();

	const otp = getContext<{
		value: string;
		maxlength: number;
		isFocused: boolean;
		selectionStart: number | null;
		selectionEnd: number | null;
		disabled: boolean;
	}>("input-otp");

	const char = $derived(otp.value[index] ?? "");

	const isActive = $derived.by(() => {
		if (!otp.isFocused) return false;
		const start = otp.selectionStart;
		const end = otp.selectionEnd;
		if (start === null || end === null) return false;
		if (start !== end && index >= start && index < end) return true;
		if (start === end && start === index) return true;
		if (start === otp.maxlength && index === otp.maxlength - 1) return true;
		return false;
	});
</script>

<div
	class={cn(
		"relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all",
		"first:rounded-l-md first:border-l last:rounded-r-md",
		isActive && "z-10 ring-2 ring-ring ring-offset-background",
		otp.disabled && "opacity-50",
		className,
	)}
	data-active={isActive || undefined}
	{...restProps}
>
	{char}
	{#if isActive && !char}
		<span class="pointer-events-none absolute h-4 w-px animate-pulse bg-foreground"></span>
	{/if}
</div>
