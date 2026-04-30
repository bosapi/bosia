<script lang="ts">
	import { cn } from "$lib/utils.ts";

	let {
		value = null as number | null,
		max = 100,
		class: className = "",
		...restProps
	}: {
		value?: number | null;
		max?: number;
		class?: string;
		[key: string]: any;
	} = $props();

	const percentage = $derived(
		value == null ? 0 : Math.min(100, Math.max(0, (value / (max || 1)) * 100)),
	);
</script>

<div
	data-slot="progress"
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value ?? undefined}
	class={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class="h-full w-full flex-1 bg-primary transition-all"
		style="transform: translateX(-{100 - percentage}%)"
	></div>
</div>
