<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";

	let {
		placeholder = "Select an option",
		class: className = "",
		...restProps
	}: {
		placeholder?: string;
		class?: string;
		[key: string]: any;
	} = $props();

	const select = getContext<{
		value: string | undefined;
		selectedLabel: string;
	}>("select");

	const display = $derived(select.value ? select.selectedLabel || select.value : "");
</script>

<span class={cn("truncate", !display && "text-muted-foreground", className)} {...restProps}>
	{display || placeholder}
</span>
