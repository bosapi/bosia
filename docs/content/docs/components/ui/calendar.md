---
title: Calendar
description: A date selection calendar with month/year navigation, keyboard support, and min/max date constraints.
demo: CalendarDemo
---

```bash
bosia add calendar
```

A composable calendar component for single date selection. Built with native JS `Date` — zero external dependencies.

## Preview

## Props

### Calendar

| Prop           | Type                                     | Default     |
| -------------- | ---------------------------------------- | ----------- |
| `value`        | `Date \| undefined`                      | `undefined` |
| `month`        | `Date \| undefined`                      | `undefined` |
| `min`          | `Date \| undefined`                      | `undefined` |
| `max`          | `Date \| undefined`                      | `undefined` |
| `disabled`     | `((date: Date) => boolean) \| undefined` | `undefined` |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `0`         |
| `fixedWeeks`   | `boolean`                                | `false`     |

- `value` — bindable selected date
- `month` — bindable controlled viewed month
- `min` / `max` — earliest/latest selectable dates
- `disabled` — custom function to disable specific dates
- `weekStartsOn` — first day of week (`0` = Sunday, `1` = Monday, etc.)
- `fixedWeeks` — always render 6 rows (42 cells)

## Sub-components

- `Calendar` — root wrapper, holds state and provides context
- `CalendarHeader` — prev/next buttons with month and year `<select>` dropdowns
- `CalendarGrid` — `<table>` with day-of-week headers and date cells
- `CalendarDay` — individual day button (used internally by `CalendarGrid`)

## Usage

```svelte
<script lang="ts">
	import { Calendar, CalendarHeader, CalendarGrid } from "$lib/components/ui/calendar";

	let selected = $state<Date | undefined>(undefined);
</script>

<Calendar bind:value={selected} class="rounded-md border">
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Controlled Month

Use `bind:month` to control which month is displayed:

```svelte
<script lang="ts">
	import { Calendar, CalendarHeader, CalendarGrid } from "$lib/components/ui/calendar";

	let selected = $state<Date | undefined>(undefined);
	let month = $state(new Date(2026, 0, 1)); // January 2026
</script>

<Calendar bind:value={selected} bind:month class="rounded-md border">
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Min / Max Constraints

```svelte
<Calendar
	bind:value={selected}
	min={new Date(2026, 0, 1)}
	max={new Date(2026, 11, 31)}
	class="rounded-md border"
>
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Custom Disabled Dates

Disable weekends:

```svelte
<Calendar
	bind:value={selected}
	disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
	class="rounded-md border"
>
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Monday Start

```svelte
<Calendar bind:value={selected} weekStartsOn={1} class="rounded-md border">
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Keyboard Navigation

| Key                        | Action                   |
| -------------------------- | ------------------------ |
| `ArrowLeft` / `ArrowRight` | Previous / next day      |
| `ArrowUp` / `ArrowDown`    | Previous / next week     |
| `Home` / `End`             | First / last day of week |
| `PageUp` / `PageDown`      | Previous / next month    |
| `Enter` / `Space`          | Select focused day       |
