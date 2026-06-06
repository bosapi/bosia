<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext, untrack } from "svelte";
	import { GripVertical } from "@lucide/svelte";

	let {
		withHandle = false,
		class: className = "",
		...restProps
	}: {
		withHandle?: boolean;
		class?: string;
		[key: string]: any;
	} = $props();

	const ctx = getContext<{
		direction: "horizontal" | "vertical";
		registerHandle(): number;
		startResize(handleIdx: number, e: PointerEvent, el: HTMLElement): void;
	}>("resizable");

	let handleIdx = $state(-1);
	let handleEl: HTMLElement | null = $state(null);

	$effect(() => {
		handleIdx = untrack(() => ctx.registerHandle());
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={handleEl}
	data-slot="resizable-handle"
	data-direction={ctx.direction}
	style="touch-action: none"
	class={cn(
		"bg-border relative flex shrink-0 items-center justify-center focus-visible:outline-hidden",
		"after:absolute after:inset-0",
		ctx.direction === "horizontal"
			? "w-px cursor-col-resize select-none after:left-1/2 after:w-1 after:-translate-x-1/2"
			: "h-px cursor-row-resize select-none after:top-1/2 after:h-1 after:-translate-y-1/2",
		className,
	)}
	onpointerdown={(e: PointerEvent) => {
		if (handleEl) ctx.startResize(handleIdx, e, handleEl);
	}}
	{...restProps}
>
	{#if withHandle}
		<div
			class={cn(
				"z-10 flex items-center justify-center rounded-sm border bg-border",
				ctx.direction === "horizontal" ? "h-4 w-3" : "h-3 w-4",
			)}
		>
			<GripVertical size={10} class={cn(ctx.direction === "vertical" && "rotate-90")} />
		</div>
	{/if}
</div>
