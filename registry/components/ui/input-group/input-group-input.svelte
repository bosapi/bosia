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
	data-slot="input-group-control"
	class={cn(
		"h-8 min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm",
		"placeholder:text-muted-foreground",
		"focus:outline-none",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	{...restProps}
/>
