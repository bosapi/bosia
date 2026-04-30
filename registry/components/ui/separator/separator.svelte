<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		class: className = "",
		orientation = "horizontal" as "horizontal" | "vertical",
		...restProps
	}: {
		class?: string;
		orientation?: "horizontal" | "vertical";
		[key: string]: any;
	} = $props();
</script>

<div
	role="separator"
	class={cn(
		"shrink-0 bg-border",
		orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
		className,
	)}
	{...restProps}
></div>
