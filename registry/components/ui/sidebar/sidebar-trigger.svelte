<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { PanelLeft } from "@lucide/svelte";

	let {
		class: className = "",
		collapsed = false,
		...restProps
	}: {
		class?: string;
		collapsed?: boolean;
		[key: string]: any;
	} = $props();
</script>

<button
	class={cn(
		"inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
		className,
	)}
	aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
	{...restProps}
>
	<PanelLeft size={16} />
</button>
