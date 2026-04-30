<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		variant = "default" as "default" | "icon",
		class: className = "",
		children,
		...restProps
	}: {
		variant?: "default" | "icon";
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const variantClasses = {
		default: "bg-transparent",
		icon: "bg-muted text-foreground size-10 rounded-lg [&_svg:not([class*='size-'])]:size-6",
	};
</script>

<div
	data-slot="empty-media"
	data-variant={variant}
	class={cn(
		"mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variantClasses[variant],
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
