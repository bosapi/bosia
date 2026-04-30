<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	type ToggleGroupType = "single" | "multiple";
	type ToggleGroupVariant = "default" | "outline";
	type ToggleGroupSize = "default" | "sm" | "lg";

	let {
		type = "single" as ToggleGroupType,
		value = $bindable(type === "single" ? "" : []) as string | string[],
		variant = "default" as ToggleGroupVariant,
		size = "default" as ToggleGroupSize,
		disabled = false,
		class: className = "",
		children,
		...restProps
	}: {
		type?: ToggleGroupType;
		value?: string | string[];
		variant?: ToggleGroupVariant;
		size?: ToggleGroupSize;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	setContext("toggle-group", {
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
		get disabled() {
			return disabled;
		},
		isSelected(v: string) {
			if (type === "single") return value === v;
			return Array.isArray(value) && value.includes(v);
		},
		toggle(v: string) {
			if (type === "single") {
				value = value === v ? "" : v;
			} else {
				if (Array.isArray(value)) {
					value = value.includes(v) ? value.filter((item) => item !== v) : [...value, v];
				}
			}
		},
	});
</script>

<div role="group" class={cn("flex items-center gap-1", className)} {...restProps}>
	{@render children?.()}
</div>
