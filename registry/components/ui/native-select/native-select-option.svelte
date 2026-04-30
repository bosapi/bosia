<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		value = undefined as string | undefined,
		disabled = false,
		children,
		...restProps
	}: {
		value?: string;
		disabled?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<option {value} {disabled} {...restProps}>
	{@render children?.()}
</option>
