<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	type Size = "xs" | "sm" | "icon-xs" | "icon-sm";

	let {
		class: className = "",
		size = "xs" as Size,
		type = "button" as "button" | "submit" | "reset",
		disabled = false,
		children,
		onclick,
		...restProps
	}: {
		class?: string;
		size?: Size;
		type?: "button" | "submit" | "reset";
		disabled?: boolean;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		[key: string]: any;
	} = $props();

	const sizeClasses: Record<Size, string> = {
		xs: "h-6 gap-1 rounded-sm px-1.5 text-xs",
		sm: "h-7 gap-1 rounded-sm px-2 text-xs",
		"icon-xs": "size-6 rounded-sm p-0",
		"icon-sm": "size-7 rounded-sm p-0",
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	data-slot="input-group-button"
	class={cn(
		"inline-flex items-center justify-center whitespace-nowrap font-medium text-foreground transition-colors",
		"hover:bg-accent hover:text-accent-foreground",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
		"disabled:pointer-events-none disabled:opacity-50",
		sizeClasses[size],
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</button>
