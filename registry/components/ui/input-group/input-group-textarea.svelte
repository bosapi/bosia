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
	data-slot="input-group-control"
	class={cn(
		"min-h-16 w-full min-w-0 resize-none bg-transparent px-3 py-2 text-sm field-sizing-content",
		"placeholder:text-muted-foreground",
		"focus:outline-none",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	{...restProps}
></textarea>
