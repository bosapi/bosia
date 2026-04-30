---
title: Range Calendar
description: A date range selection calendar with start/end selection, hover preview, and keyboard navigation.
demo: RangeCalendarDemo
---

```bash
bosia add range-calendar
```

A composable calendar for selecting date ranges. Built on top of the `calendar` component — reuses `CalendarHeader` for navigation. Native JS `Date`, zero external dependencies.

## Preview

## Props

### RangeCalendar

| Prop           | Type                                     | Default                                |
| -------------- | ---------------------------------------- | -------------------------------------- |
| `value`        | `{ start?: Date; end?: Date }`           | `{ start: undefined, end: undefined }` |
| `month`        | `Date \| undefined`                      | `undefined`                            |
| `min`          | `Date \| undefined`                      | `undefined`                            |
| `max`          | `Date \| undefined`                      | `undefined`                            |
| `disabled`     | `((date: Date) => boolean) \| undefined` | `undefined`                            |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `0`                                    |
| `fixedWeeks`   | `boolean`                                | `false`                                |

- `value` — bindable range object with `start` and `end` dates
- `month` — bindable controlled viewed month
- `min` / `max` — earliest/latest selectable dates
- `disabled` — custom function to disable specific dates
- `weekStartsOn` — first day of week (`0` = Sunday, `1` = Monday, etc.)
- `fixedWeeks` — always render 6 rows (42 cells)

## Sub-components

- `RangeCalendar` — root wrapper, holds range state and provides dual context
- `RangeCalendarHeader` — re-exported `CalendarHeader` with prev/next and month/year selects
- `RangeCalendarGrid` — `<table>` with day-of-week headers and range-aware date cells
- `RangeCalendarDay` — individual day button with range styling (used internally by `RangeCalendarGrid`)

## Selection Behavior

1. **Click** — sets start date
2. **Click again** (on or after start) — sets end date
3. **Click before start** — resets and sets new start
4. **Click when both set** — resets range, sets new start

While selecting (start set, no end), hovering shows a **preview range** with lighter styling.

## Usage

```svelte
<script lang="ts">
	import { RangeCalendar, RangeCalendarGrid } from "$lib/components/ui/range-calendar";
	import { CalendarHeader } from "$lib/components/ui/calendar";

	let value = $state<{ start?: Date; end?: Date }>({ start: undefined, end: undefined });
</script>

<RangeCalendar bind:value class="rounded-md border">
	<CalendarHeader />
	<RangeCalendarGrid />
</RangeCalendar>
```

## Min / Max Constraints

```svelte
<RangeCalendar
	bind:value
	min={new Date(2026, 0, 1)}
	max={new Date(2026, 11, 31)}
	class="rounded-md border"
>
	<CalendarHeader />
	<RangeCalendarGrid />
</RangeCalendar>
```

## Disable Weekends

```svelte
<RangeCalendar
	bind:value
	disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
	class="rounded-md border"
>
	<CalendarHeader />
	<RangeCalendarGrid />
</RangeCalendar>
```

## Keyboard Navigation

| Key                        | Action                   |
| -------------------------- | ------------------------ |
| `ArrowLeft` / `ArrowRight` | Previous / next day      |
| `ArrowUp` / `ArrowDown`    | Previous / next week     |
| `Home` / `End`             | First / last day of week |
| `PageUp` / `PageDown`      | Previous / next month    |
| `Enter` / `Space`          | Select focused day       |
