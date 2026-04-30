<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	type ButtonSize = "default" | "sm" | "lg" | "icon";

	let {
		class: className = "",
		variant = "default" as ButtonVariant,
		size = "default" as ButtonSize,
		disabled = false,
		type = "button" as "button" | "submit" | "reset",
		href = undefined as string | undefined,
		children,
		onclick,
		...restProps
	}: {
		class?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		type?: "button" | "submit" | "reset";
		href?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		[key: string]: any;
	} = $props();

	const variantClasses: Record<ButtonVariant, string> = {
		default: "bg-primary text-primary-foreground hover:bg-primary/90",
		destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
		outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
		ghost: "hover:bg-accent hover:text-accent-foreground",
		link: "text-primary underline-offset-4 hover:underline",
	};

	const sizeClasses: Record<ButtonSize, string> = {
		default: "h-8 px-3 py-1.5",
		sm: "h-7 rounded-md px-2.5 text-xs",
		lg: "h-9 rounded-md px-5",
		icon: "h-8 w-8",
	};

	const baseClass = $derived(
		cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"active:scale-[0.97] active:opacity-80",
			"disabled:pointer-events-none disabled:opacity-50",
			variantClasses[variant],
			sizeClasses[size],
			className,
		),
	);
</script>

{#if href}
	<a {href} class={baseClass} {...restProps}>
		{@render children?.()}
	</a>
{:else}
	<button {type} {disabled} class={baseClass} {onclick} {...restProps}>
		{@render children?.()}
	</button>
{/if}
