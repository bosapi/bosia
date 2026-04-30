<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	type ToggleGroupVariant = "default" | "outline";
	type ToggleGroupSize = "default" | "sm" | "lg";

	let {
		value,
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		value: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const group = getContext<{
		variant: ToggleGroupVariant;
		size: ToggleGroupSize;
		disabled: boolean;
		isSelected: (v: string) => boolean;
		toggle: (v: string) => void;
	}>("toggle-group");

	const isPressed = $derived(group.isSelected(value));
	const isDisabled = $derived(disabled || group.disabled);
	const dataState = $derived(isPressed ? "on" : "off");

	function onclick() {
		if (isDisabled) return;
		group.toggle(value);
	}

	function onkeydown(e: KeyboardEvent) {
		const current = e.currentTarget as HTMLButtonElement;
		const root = current.closest("[role='group']");
		if (!root) return;
		const items = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-value]"));
		const index = items.indexOf(current);
		let next: HTMLButtonElement | undefined;

		if (e.key === "ArrowDown" || e.key === "ArrowRight") {
			e.preventDefault();
			next = findNextEnabled(items, index, 1);
		} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
			e.preventDefault();
			next = findNextEnabled(items, index, -1);
		}

		if (next) {
			next.focus();
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

	const variantClasses: Record<ToggleGroupVariant, string> = {
		default: "bg-transparent",
		outline: "border border-input bg-transparent shadow-sm",
	};

	const sizeClasses: Record<ToggleGroupSize, string> = {
		default: "h-9 px-3 min-w-9",
		sm: "h-8 px-2 min-w-8",
		lg: "h-10 px-4 min-w-10",
	};
</script>

<button
	type="button"
	aria-pressed={isPressed}
	data-state={dataState}
	data-value={value}
	disabled={isDisabled}
	tabindex={isPressed ? 0 : -1}
	class={cn(
		"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors",
		"hover:bg-muted hover:text-muted-foreground",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
		variantClasses[group.variant],
		sizeClasses[group.size],
		className,
	)}
	{onclick}
	{onkeydown}
	{...restProps}
>
	{@render children?.()}
</button>
