<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	type Orientation = "horizontal" | "vertical";

	let {
		orientation = "horizontal" as Orientation,
		class: className = "",
		children,
		...restProps
	}: {
		orientation?: Orientation;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<div
	role="group"
	data-slot="button-group"
	data-orientation={orientation}
	class={cn(
		"inline-flex",
		"[&>*]:rounded-none",
		orientation === "vertical"
			? [
					"flex-col",
					"[&>*:not(:first-child)]:-mt-px",
					"[&>*:first-child]:rounded-t-md",
					"[&>*:last-child]:rounded-b-md",
				]
			: [
					"flex-row",
					"[&>*:not(:first-child)]:-ml-px",
					"[&>*:first-child]:rounded-l-md",
					"[&>*:last-child]:rounded-r-md",
				],
		"[&>*:hover]:z-10 [&>*:focus-visible]:z-10",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>
