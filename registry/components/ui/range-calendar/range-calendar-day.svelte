<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";

	let {
		class: className = "",
		date,
		outsideMonth,
		isToday,
		isDisabled,
		isRangeStart,
		isRangeEnd,
		isInRange,
		isInPreview,
		...restProps
	}: {
		class?: string;
		date: Date;
		outsideMonth: boolean;
		isToday: boolean;
		isDisabled: boolean;
		isRangeStart: boolean;
		isRangeEnd: boolean;
		isInRange: boolean;
		isInPreview: boolean;
		[key: string]: any;
	} = $props();

	const calendar = getContext<{
		select: (date: Date) => void;
	}>("calendar");

	const rangeCtx = getContext<{
		isSelecting: boolean;
		setHoveredDate: (d: Date | undefined) => void;
	}>("range-calendar");

	const dateStr = $derived(date.toISOString().split("T")[0]);
	const ariaLabel = $derived(
		date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
	);

	const isEndpoint = $derived(isRangeStart || isRangeEnd);
</script>

<button
	type="button"
	class={cn(
		"inline-flex h-8 w-8 items-center justify-center text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		// Endpoint styling (start/end)
		isEndpoint &&
			"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
		// Range middle
		isInRange && !isEndpoint && "bg-accent text-accent-foreground",
		// Preview range
		isInPreview && !isEndpoint && !isInRange && "bg-accent/50 text-accent-foreground",
		// Rounding: start gets left corners, end gets right corners, middle is flat
		isRangeStart && !isRangeEnd && "rounded-l-md rounded-r-none",
		isRangeEnd && !isRangeStart && "rounded-r-md rounded-l-none",
		isRangeStart && isRangeEnd && "rounded-md",
		isInRange && !isEndpoint && "rounded-none",
		isInPreview && !isEndpoint && !isInRange && "rounded-none",
		// No range state → normal rounded
		!isEndpoint && !isInRange && !isInPreview && "rounded-md",
		// Today ring
		!isEndpoint && isToday && "bg-accent text-accent-foreground",
		// Default hover for unselected
		!isEndpoint &&
			!isInRange &&
			!isInPreview &&
			!isToday &&
			!outsideMonth &&
			!isDisabled &&
			"hover:bg-accent hover:text-accent-foreground",
		// Outside month
		outsideMonth && "text-muted-foreground opacity-50",
		// Disabled
		isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
		className,
	)}
	disabled={isDisabled}
	tabindex={isRangeStart || isToday ? 0 : -1}
	data-date={dateStr}
	data-range-start={isRangeStart ? "" : undefined}
	data-range-end={isRangeEnd ? "" : undefined}
	data-range-middle={isInRange && !isEndpoint ? "" : undefined}
	data-range-preview={isInPreview && !isEndpoint && !isInRange ? "" : undefined}
	data-today={isToday ? "" : undefined}
	data-outside-month={outsideMonth ? "" : undefined}
	data-disabled={isDisabled ? "" : undefined}
	aria-label={ariaLabel}
	onclick={() => !isDisabled && calendar.select(date)}
	onmouseenter={() => rangeCtx.isSelecting && rangeCtx.setHoveredDate(date)}
	{...restProps}
>
	{date.getDate()}
</button>
