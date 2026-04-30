<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		label,
		disabled = false,
		children,
		...restProps
	}: {
		label: string;
		disabled?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<optgroup {label} {disabled} {...restProps}>
	{@render children?.()}
</optgroup>
