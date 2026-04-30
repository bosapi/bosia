<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import RangeCalendarDay from "./range-calendar-day.svelte";

	let {
		class: className = "",
		...restProps
	}: {
		class?: string;
		[key: string]: any;
	} = $props();

	const calendar = getContext<{
		viewedMonth: number;
		viewedYear: number;
		value: Date | undefined;
		today: Date;
		min: Date | undefined;
		max: Date | undefined;
		weekStartsOn: number;
		fixedWeeks: boolean;
		disabled: ((date: Date) => boolean) | undefined;
		select: (date: Date) => void;
	}>("calendar");

	const rangeCtx = getContext<{
		value: { start?: Date; end?: Date };
		hoveredDate: Date | undefined;
		isSelecting: boolean;
		setHoveredDate: (d: Date | undefined) => void;
	}>("range-calendar");

	const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

	const orderedDayNames = $derived.by(() => {
		const s = calendar.weekStartsOn;
		return [...dayNames.slice(s), ...dayNames.slice(0, s)];
	});

	const weeks = $derived.by(() => {
		const year = calendar.viewedYear;
		const month = calendar.viewedMonth;
		const firstOfMonth = new Date(year, month, 1);
		const firstDayOfWeek = firstOfMonth.getDay();
		const startOffset = (firstDayOfWeek - calendar.weekStartsOn + 7) % 7;

		const start = new Date(year, month, 1 - startOffset);
		const rows: Date[][] = [];
		const current = new Date(start);

		const minRows = calendar.fixedWeeks ? 6 : 4;
		while (rows.length < minRows || (current.getMonth() === month && rows.length < 6)) {
			const week: Date[] = [];
			for (let d = 0; d < 7; d++) {
				week.push(new Date(current));
				current.setDate(current.getDate() + 1);
			}
			rows.push(week);
		}

		if (calendar.fixedWeeks) {
			while (rows.length < 6) {
				const week: Date[] = [];
				for (let d = 0; d < 7; d++) {
					week.push(new Date(current));
					current.setDate(current.getDate() + 1);
				}
				rows.push(week);
			}
		}

		return rows;
	});

	let focusedDate = $state<Date | null>(null);

	function isSameDay(a: Date, b: Date): boolean {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	}

	function isDateDisabled(date: Date): boolean {
		if (calendar.min && date < calendar.min) return true;
		if (calendar.max && date > calendar.max) return true;
		if (calendar.disabled?.(date)) return true;
		return false;
	}

	function isDateInRange(date: Date, start: Date, end: Date): boolean {
		return date >= start && date <= end;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!focusedDate) return;

		let next: Date | null = null;

		switch (e.key) {
			case "ArrowLeft":
				next = new Date(focusedDate);
				next.setDate(next.getDate() - 1);
				break;
			case "ArrowRight":
				next = new Date(focusedDate);
				next.setDate(next.getDate() + 1);
				break;
			case "ArrowUp":
				next = new Date(focusedDate);
				next.setDate(next.getDate() - 7);
				break;
			case "ArrowDown":
				next = new Date(focusedDate);
				next.setDate(next.getDate() + 7);
				break;
			case "Home": {
				next = new Date(focusedDate);
				const dayOfWeek = (next.getDay() - calendar.weekStartsOn + 7) % 7;
				next.setDate(next.getDate() - dayOfWeek);
				break;
			}
			case "End": {
				next = new Date(focusedDate);
				const dayOfWeek = (next.getDay() - calendar.weekStartsOn + 7) % 7;
				next.setDate(next.getDate() + (6 - dayOfWeek));
				break;
			}
			case "PageUp":
				next = new Date(focusedDate);
				next.setMonth(next.getMonth() - 1);
				break;
			case "PageDown":
				next = new Date(focusedDate);
				next.setMonth(next.getMonth() + 1);
				break;
			case "Enter":
			case " ":
				e.preventDefault();
				if (!isDateDisabled(focusedDate)) {
					calendar.select(focusedDate);
				}
				return;
			default:
				return;
		}

		if (next) {
			e.preventDefault();
			if (!isDateDisabled(next)) {
				focusedDate = next;
				requestAnimationFrame(() => {
					const grid = e.currentTarget as HTMLElement;
					const btn = grid?.querySelector(
						`[data-date="${next!.toISOString().split("T")[0]}"]`,
					) as HTMLElement;
					btn?.focus();
				});
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<table
	class={cn("w-full border-collapse", className)}
	role="grid"
	aria-label="Range Calendar"
	onkeydown={handleKeydown}
	onmouseleave={() => rangeCtx.setHoveredDate(undefined)}
	{...restProps}
>
	<thead>
		<tr class="flex">
			{#each orderedDayNames as day}
				<th
					class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground"
					scope="col"
					aria-label={day}
				>
					{day}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each weeks as week}
			<tr class="flex">
				{#each week as date}
					{@const outsideMonth = date.getMonth() !== calendar.viewedMonth}
					{@const isToday = isSameDay(date, calendar.today)}
					{@const isDisabled = isDateDisabled(date)}
					{@const rangeStart = rangeCtx.value.start}
					{@const rangeEnd = rangeCtx.value.end}
					{@const isRangeStart = rangeStart ? isSameDay(date, rangeStart) : false}
					{@const isRangeEnd = rangeEnd ? isSameDay(date, rangeEnd) : false}
					{@const isInRange =
						rangeStart && rangeEnd
							? isDateInRange(date, rangeStart, rangeEnd) &&
								!isRangeStart &&
								!isRangeEnd
							: false}
					{@const previewEnd =
						rangeCtx.isSelecting &&
						rangeCtx.hoveredDate &&
						rangeStart &&
						rangeCtx.hoveredDate >= rangeStart
							? rangeCtx.hoveredDate
							: undefined}
					{@const isInPreview =
						previewEnd && rangeStart
							? isDateInRange(date, rangeStart, previewEnd) &&
								!isSameDay(date, rangeStart)
							: false}
					<td role="gridcell" class="p-0">
						<RangeCalendarDay
							{date}
							{outsideMonth}
							{isToday}
							{isDisabled}
							{isRangeStart}
							{isRangeEnd}
							{isInRange}
							isInPreview={isInPreview ?? false}
							onfocus={() => (focusedDate = date)}
						/>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
