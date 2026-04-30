<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		class: className = "",
		type = "text",
		id = undefined as string | undefined,
		name = undefined as string | undefined,
		value = $bindable(""),
		placeholder = "",
		disabled = false,
		...restProps
	}: {
		class?: string;
		type?: string;
		id?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		[key: string]: any;
	} = $props();
</script>

<input
	{type}
	{id}
	{name}
	bind:value
	{placeholder}
	{disabled}
	class={cn(
		"flex h-8 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors",
		"file:border-0 file:bg-transparent file:text-sm file:font-medium",
		"placeholder:text-muted-foreground",
		"focus:outline-none focus:border-primary",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	{...restProps}
/>
