<script lang="ts">
	import { Label } from "../label";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		children,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const ctx = getContext<{ id: string; error?: string }>("field");
</script>

<Label for={ctx.id} class={className} {...restProps}>
	{@render children?.()}
</Label>
