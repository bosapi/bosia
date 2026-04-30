<script lang="ts">
	import { cn } from "$lib/utils.ts";
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

	const dialog = getContext<{ toggle: () => void }>("alert-dialog");
</script>

<button
	type="button"
	class={cn("inline-flex items-center justify-center", className)}
	onclick={() => dialog?.toggle()}
	{...restProps}
>
	{@render children?.()}
</button>
