<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(""),
		class: className = "",
		children,
		...restProps
	}: {
		value?: string;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const baseId = `tabs-${Math.random().toString(36).slice(2, 10)}`;

	setContext("tabs", {
		get value() {
			return value;
		},
		setValue(v: string) {
			value = v;
		},
		baseId,
	});
</script>

<div data-orientation="horizontal" class={cn("flex flex-col gap-2", className)} {...restProps}>
	{@render children?.()}
</div>
