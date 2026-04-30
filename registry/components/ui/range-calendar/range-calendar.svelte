<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		value = $bindable<{ start?: Date; end?: Date }>({ start: undefined, end: undefined }),
		month = $bindable<Date | undefined>(undefined),
		min,
		max,
		disabled,
		weekStartsOn = 0,
		fixedWeeks = false,
		children,
		...restProps
	}: {
		class?: string;
		value?: { start?: Date; end?: Date };
		month?: Date | undefined;
		min?: Date | undefined;
		max?: Date | undefined;
		disabled?: ((date: Date) => boolean) | undefined;
		weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
		fixedWeeks?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let viewedYear = $state(
		month?.getFullYear() ?? value.start?.getFullYear() ?? today.getFullYear(),
	);
	let viewedMonth = $state(month?.getMonth() ?? value.start?.getMonth() ?? today.getMonth());
	let hoveredDate = $state<Date | undefined>(undefined);

	// Sync when controlled month prop changes
	$effect(() => {
		if (month) {
			viewedYear = month.getFullYear();
			viewedMonth = month.getMonth();
		}
	});

	function select(date: Date) {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);

		if (!value.start || (value.start && value.end)) {
			// No start yet, or both set → reset with new start
			value = { start: d, end: undefined };
		} else {
			// Start set, no end
			if (d < value.start) {
				// Clicked before start → reset with new start
				value = { start: d, end: undefined };
			} else {
				// Clicked on or after start → set end
				value = { start: value.start, end: d };
			}
		}
	}

	function setViewMonth(m: number) {
		viewedMonth = m;
		month = new Date(viewedYear, viewedMonth, 1);
	}

	function setViewYear(y: number) {
		viewedYear = y;
		month = new Date(viewedYear, viewedMonth, 1);
	}

	function prevMonth() {
		if (viewedMonth === 0) {
			viewedMonth = 11;
			viewedYear--;
		} else {
			viewedMonth--;
		}
		month = new Date(viewedYear, viewedMonth, 1);
	}

	function nextMonth() {
		if (viewedMonth === 11) {
			viewedMonth = 0;
			viewedYear++;
		} else {
			viewedMonth++;
		}
		month = new Date(viewedYear, viewedMonth, 1);
	}

	const isSelecting = $derived(!!value.start && !value.end);

	// "calendar" context — same shape as calendar.svelte so CalendarHeader works
	setContext("calendar", {
		get viewedMonth() {
			return viewedMonth;
		},
		get viewedYear() {
			return viewedYear;
		},
		get value() {
			return value.start;
		},
		get today() {
			return today;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get weekStartsOn() {
			return weekStartsOn;
		},
		get fixedWeeks() {
			return fixedWeeks;
		},
		get disabled() {
			return disabled;
		},
		select,
		setMonth: setViewMonth,
		setYear: setViewYear,
		prevMonth,
		nextMonth,
	});

	// "range-calendar" context — range-specific state
	setContext("range-calendar", {
		get value() {
			return value;
		},
		get hoveredDate() {
			return hoveredDate;
		},
		get isSelecting() {
			return isSelecting;
		},
		setHoveredDate(d: Date | undefined) {
			hoveredDate = d;
		},
	});
</script>

<div class={cn("p-3", className)} data-range-calendar {...restProps}>
	{@render children?.()}
</div>
