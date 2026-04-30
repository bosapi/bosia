<script lang="ts">
	import type { Snippet } from "svelte";
	import { setDirectionContext, type Direction } from "./context.ts";

	let {
		direction = "ltr" as Direction,
		children,
		...restProps
	}: {
		direction?: Direction;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	setDirectionContext({
		get direction() {
			return direction;
		},
	});
</script>

<div dir={direction} {...restProps}>
	{@render children?.()}
</div>
