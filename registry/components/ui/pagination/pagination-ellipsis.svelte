<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { MoreHorizontal } from "@lucide/svelte";

	let {
		class: className = "",
		...restProps
	}: {
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<span
	aria-hidden="true"
	class={cn("flex h-9 w-9 items-center justify-center", className)}
	{...restProps}
>
	<MoreHorizontal class="h-4 w-4" />
	<span class="sr-only">More pages</span>
</span>
