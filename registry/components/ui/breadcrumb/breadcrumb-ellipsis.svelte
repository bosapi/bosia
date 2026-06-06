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
	role="presentation"
	aria-hidden="true"
	class={cn("flex size-9 items-center justify-center", className)}
	{...restProps}
>
	<MoreHorizontal class="size-4" />
	<span class="sr-only">More</span>
</span>
