<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		class: className = "",
		id = undefined as string | undefined,
		name = undefined as string | undefined,
		value = $bindable(""),
		placeholder = "",
		disabled = false,
		...restProps
	}: {
		class?: string;
		id?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		[key: string]: any;
	} = $props();
</script>

<textarea
	{id}
	{name}
	bind:value
	{placeholder}
	{disabled}
	class={cn(
		"flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors",
		"field-sizing-content",
		"placeholder:text-muted-foreground",
		"focus:outline-none focus:border-primary",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	{...restProps}
></textarea>
