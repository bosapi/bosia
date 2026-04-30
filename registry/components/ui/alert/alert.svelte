<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	type AlertVariant = "default" | "destructive";

	let {
		class: className = "",
		variant = "default" as AlertVariant,
		children,
		...restProps
	}: {
		class?: string;
		variant?: AlertVariant;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const variantClasses: Record<AlertVariant, string> = {
		default: "bg-card text-card-foreground",
		destructive:
			"border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
	};
</script>

<div
	role="alert"
	class={cn(
		"relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
		variantClasses[variant],
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
