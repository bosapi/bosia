<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(""),
		maxlength = 6,
		pattern = undefined as RegExp | undefined,
		disabled = false,
		name = undefined as string | undefined,
		id = undefined as string | undefined,
		autocomplete = "one-time-code",
		inputmode = "numeric" as
			| "none"
			| "text"
			| "tel"
			| "url"
			| "email"
			| "numeric"
			| "decimal"
			| "search",
		onComplete = undefined as ((value: string) => void) | undefined,
		class: className = "",
		containerClass = "",
		children,
		...restProps
	}: {
		value?: string;
		maxlength?: number;
		pattern?: RegExp;
		disabled?: boolean;
		name?: string;
		id?: string;
		autocomplete?: string;
		inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
		onComplete?: (value: string) => void;
		class?: string;
		containerClass?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let isFocused = $state(false);
	let selectionStart = $state<number | null>(null);
	let selectionEnd = $state<number | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);

	let lastValid = value;

	setContext("input-otp", {
		get value() {
			return value;
		},
		get maxlength() {
			return maxlength;
		},
		get isFocused() {
			return isFocused;
		},
		get selectionStart() {
			return selectionStart;
		},
		get selectionEnd() {
			return selectionEnd;
		},
		get disabled() {
			return disabled;
		},
		focus() {
			if (!inputEl) return;
			inputEl.focus();
			const end = inputEl.value.length;
			try {
				inputEl.setSelectionRange(end, end);
			} catch {}
			selectionStart = end;
			selectionEnd = end;
		},
	});

	function syncSelection() {
		if (!inputEl) return;
		selectionStart = inputEl.selectionStart;
		selectionEnd = inputEl.selectionEnd;
	}

	function oninput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const next = target.value;
		if (pattern && next !== "" && !pattern.test(next)) {
			target.value = lastValid;
			value = lastValid;
			return;
		}
		lastValid = next;
		value = next;
		syncSelection();
		if (onComplete && next.length === maxlength) {
			onComplete(next);
		}
	}

	function onfocus() {
		isFocused = true;
		syncSelection();
	}

	function onblur() {
		isFocused = false;
	}
</script>

<div class={cn("relative flex items-center gap-2", disabled && "opacity-50", containerClass)}>
	{@render children?.()}
	<input
		bind:this={inputEl}
		bind:value
		{id}
		{name}
		{disabled}
		{autocomplete}
		{inputmode}
		{maxlength}
		type="text"
		{oninput}
		{onfocus}
		{onblur}
		onselect={syncSelection}
		onkeyup={syncSelection}
		onclick={syncSelection}
		class={cn(
			"absolute inset-0 w-full opacity-0",
			"pointer-events-auto",
			"disabled:cursor-not-allowed",
			className,
		)}
		{...restProps}
	/>
</div>
