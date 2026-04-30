<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	type ToggleVariant = "default" | "outline";
	type ToggleSize = "default" | "sm" | "lg";

	let {
		pressed = $bindable(false),
		variant = "default" as ToggleVariant,
		size = "default" as ToggleSize,
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		pressed?: boolean;
		variant?: ToggleVariant;
		size?: ToggleSize;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const dataState = $derived(pressed ? "on" : "off");

	function toggle() {
		if (disabled) return;
		pressed = !pressed;
	}

	const variantClasses: Record<ToggleVariant, string> = {
		default: "bg-transparent",
		outline: "border border-input bg-transparent shadow-sm",
	};

	const sizeClasses: Record<ToggleSize, string> = {
		default: "h-9 px-3 min-w-9",
		sm: "h-8 px-2 min-w-8",
		lg: "h-10 px-4 min-w-10",
	};
</script>

<button
	type="button"
	aria-pressed={pressed}
	data-state={dataState}
	{disabled}
	class={cn(
		"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors",
		"hover:bg-muted hover:text-muted-foreground",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
		variantClasses[variant],
		sizeClasses[size],
		className,
	)}
	onclick={toggle}
	{...restProps}
>
	{@render children?.()}
</button>
