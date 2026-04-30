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

<div class={cn("animate-pulse rounded-md bg-accent", className)} {...restProps}></div>
