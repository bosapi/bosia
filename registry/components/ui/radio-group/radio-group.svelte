<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(undefined as string | undefined),
		name = undefined as string | undefined,
		disabled = false,
		required = false,
		class: className = "",
		children,
		...restProps
	}: {
		value?: string;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	setContext("radio-group", {
		get value() {
			return value;
		},
		get name() {
			return name;
		},
		get disabled() {
			return disabled;
		},
		select(newValue: string) {
			value = newValue;
		},
	});
</script>

<div
	role="radiogroup"
	aria-required={required || undefined}
	class={cn("grid gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
