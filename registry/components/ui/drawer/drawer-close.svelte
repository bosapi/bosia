<script lang="ts">
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		children,
		...restProps
	}: {
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const drawer = getContext<{ close: () => void }>("drawer");

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			drawer?.close();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	style="display: contents"
	onclick={() => drawer?.close()}
	onkeydown={onKeydown}
	{...restProps}
>
	{@render children?.()}
</span>
