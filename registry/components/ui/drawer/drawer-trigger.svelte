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

	const drawer = getContext<{ toggle: () => void }>("drawer");

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			drawer?.toggle();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	style="display: contents"
	onclick={() => drawer?.toggle()}
	onkeydown={onKeydown}
	{...restProps}
>
	{@render children?.()}
</span>
