<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		class: className = "",
		...restProps
	}: {
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<div role="separator" class={cn("-mx-1 h-px bg-border", className)} {...restProps}></div>
