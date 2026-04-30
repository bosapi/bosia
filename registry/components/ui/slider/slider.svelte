<script lang="ts">
	import { cn } from "$lib/utils.ts";

	type SliderType = "single" | "range";
	type Orientation = "horizontal" | "vertical";

	let {
		type = "single" as SliderType,
		value = $bindable(type === "single" ? 0 : [0, 0]) as number | [number, number],
		min = 0,
		max = 100,
		step = 1,
		orientation = "horizontal" as Orientation,
		disabled = false,
		name = undefined as string | undefined,
		id = undefined as string | undefined,
		class: className = "",
		...restProps
	}: {
		type?: SliderType;
		value?: number | [number, number];
		min?: number;
		max?: number;
		step?: number;
		orientation?: Orientation;
		disabled?: boolean;
		name?: string;
		id?: string;
		class?: string;
		[key: string]: any;
	} = $props();

	let draggingThumb: number | null = $state(null);

	const isHorizontal = $derived(orientation === "horizontal");

	const values = $derived(type === "single" ? [value as number] : (value as [number, number]));

	const percentages = $derived(values.map((v) => ((v - min) / (max - min)) * 100));

	const rangeStart = $derived(type === "single" ? 0 : percentages[0]);
	const rangeEnd = $derived(type === "single" ? percentages[0] : percentages[1]);

	function clamp(val: number): number {
		return Math.min(max, Math.max(min, val));
	}

	function snap(val: number): number {
		const snapped = Math.round((val - min) / step) * step + min;
		// Fix floating point
		const decimals = (step.toString().split(".")[1] || "").length;
		return clamp(Number(snapped.toFixed(decimals)));
	}

	function getValueFromPosition(clientX: number, clientY: number, rect: DOMRect): number {
		let ratio: number;
		if (isHorizontal) {
			ratio = (clientX - rect.left) / rect.width;
		} else {
			// Vertical: bottom is min, top is max
			ratio = 1 - (clientY - rect.top) / rect.height;
		}
		ratio = Math.max(0, Math.min(1, ratio));
		return snap(min + ratio * (max - min));
	}

	function updateValue(thumbIndex: number, newVal: number) {
		if (type === "single") {
			value = newVal;
		} else {
			const arr = [...(value as [number, number])] as [number, number];
			arr[thumbIndex] = newVal;
			// Keep ordered
			if (thumbIndex === 0 && arr[0] > arr[1]) arr[0] = arr[1];
			if (thumbIndex === 1 && arr[1] < arr[0]) arr[1] = arr[0];
			value = arr;
		}
	}

	function nearestThumb(val: number): number {
		if (type === "single") return 0;
		const arr = value as [number, number];
		const d0 = Math.abs(val - arr[0]);
		const d1 = Math.abs(val - arr[1]);
		return d0 <= d1 ? 0 : 1;
	}

	function onTrackPointerDown(e: PointerEvent) {
		if (disabled) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const newVal = getValueFromPosition(e.clientX, e.clientY, rect);
		const thumb = nearestThumb(newVal);
		updateValue(thumb, newVal);
		draggingThumb = thumb;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onTrackPointerMove(e: PointerEvent) {
		if (draggingThumb === null || disabled) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const newVal = getValueFromPosition(e.clientX, e.clientY, rect);
		updateValue(draggingThumb, newVal);
	}

	function onTrackPointerUp() {
		draggingThumb = null;
	}

	function onThumbPointerDown(e: PointerEvent, thumbIndex: number) {
		if (disabled) return;
		e.stopPropagation();
		draggingThumb = thumbIndex;
		const track = (e.currentTarget as HTMLElement).parentElement!;
		track.setPointerCapture(e.pointerId);
	}

	function onThumbKeyDown(e: KeyboardEvent, thumbIndex: number) {
		if (disabled) return;
		const current = values[thumbIndex];
		let newVal: number | undefined;

		switch (e.key) {
			case "ArrowRight":
			case "ArrowUp":
				newVal = snap(current + step);
				break;
			case "ArrowLeft":
			case "ArrowDown":
				newVal = snap(current - step);
				break;
			case "PageUp":
				newVal = snap(current + step * 10);
				break;
			case "PageDown":
				newVal = snap(current - step * 10);
				break;
			case "Home":
				newVal = min;
				break;
			case "End":
				newVal = max;
				break;
			default:
				return;
		}

		e.preventDefault();
		updateValue(thumbIndex, newVal);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	data-slot="slider"
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	{id}
	class={cn(
		"relative flex touch-none select-none items-center",
		isHorizontal ? "w-full" : "h-full flex-col",
		disabled && "opacity-50 pointer-events-none",
		className,
	)}
	onpointerdown={onTrackPointerDown}
	onpointermove={onTrackPointerMove}
	onpointerup={onTrackPointerUp}
	{...restProps}
>
	<!-- Track -->
	<span
		data-slot="slider-track"
		class={cn(
			"relative grow overflow-hidden rounded-full bg-primary/20",
			isHorizontal ? "h-2 w-full" : "w-2 h-full",
		)}
	>
		<!-- Range fill -->
		<span
			data-slot="slider-range"
			class="absolute bg-primary rounded-full"
			style={isHorizontal
				? `left:${rangeStart}%;right:${100 - rangeEnd}%`
				: `bottom:${rangeStart}%;top:${100 - rangeEnd}%`}
			style:height={isHorizontal ? "100%" : undefined}
			style:width={isHorizontal ? undefined : "100%"}
		></span>
	</span>

	<!-- Thumbs -->
	{#each values as val, i}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			role="slider"
			data-slot="slider-thumb"
			tabindex={disabled ? -1 : 0}
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={val}
			aria-orientation={orientation}
			aria-disabled={disabled || undefined}
			class={cn(
				"absolute block size-5 rounded-full border-2 border-primary bg-background shadow transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"cursor-grab active:cursor-grabbing",
			)}
			style={isHorizontal
				? `left:${percentages[i]}%;top:50%;transform:translate(-50%,-50%)`
				: `bottom:${percentages[i]}%;left:50%;transform:translate(-50%,50%)`}
			onpointerdown={(e) => onThumbPointerDown(e, i)}
			onkeydown={(e) => onThumbKeyDown(e, i)}
		></span>
	{/each}
</div>

{#if name}
	{#if type === "single"}
		<input type="hidden" {name} value={value as number} />
	{:else}
		<input type="hidden" name="{name}[]" value={(value as [number, number])[0]} />
		<input type="hidden" name="{name}[]" value={(value as [number, number])[1]} />
	{/if}
{/if}
