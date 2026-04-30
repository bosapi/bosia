---
title: Date Picker
description: A date picker built on Popover + Calendar.
demo: DatePickerDemo
---

```bash
bosia add date-picker
```

Convenience wrapper that composes `Popover` + `Calendar` into a single date picker. The popover auto-closes when a date is selected. For full control, compose `Popover` + `Calendar` directly.

## Preview

## Props

| Prop             | Type                                     | Default               |
| ---------------- | ---------------------------------------- | --------------------- |
| `value`          | `Date \| undefined` (bindable)           | `undefined`           |
| `placeholder`    | `string`                                 | `"Pick a date"`       |
| `min`            | `Date \| undefined`                      | `undefined`           |
| `max`            | `Date \| undefined`                      | `undefined`           |
| `disabled`       | `((date: Date) => boolean) \| undefined` | `undefined`           |
| `weekStartsOn`   | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `0`                   |
| `fixedWeeks`     | `boolean`                                | `false`               |
| `buttonDisabled` | `boolean`                                | `false`               |
| `formatDate`     | `(date: Date) => string`                 | `toLocaleDateString`  |
| `contentClass`   | `string`                                 | `""`                  |
| `trigger`        | `Snippet<[Date \| undefined]>`           | default button        |
| `class`          | `string`                                 | `""` (trigger button) |

## Usage

```svelte
<script lang="ts">
	import { DatePicker } from "$lib/components/ui/date-picker";

	let date = $state<Date | undefined>(undefined);
</script>

<DatePicker bind:value={date} />
```

## With Constraints

```svelte
<DatePicker bind:value={date} min={new Date(2026, 0, 1)} max={new Date(2026, 11, 31)} />
```

## Custom Format

```svelte
<DatePicker bind:value={date} formatDate={(d) => d.toISOString().split("T")[0]} />
```

## Custom Trigger

Use the `trigger` snippet to fully customize the trigger content:

```svelte
<DatePicker bind:value={date}>
	{#snippet trigger(value)}
		<span>{value ? value.toLocaleDateString() : "Choose a date..."}</span>
	{/snippet}
</DatePicker>
```

## Disabled Dates

Disable weekends:

```svelte
<DatePicker bind:value={date} disabled={(d) => d.getDay() === 0 || d.getDay() === 6} />
```

## Behavior

- Click the trigger to open the calendar popover; click outside or press `Escape` to close.
- Selecting a date auto-closes the popover.
- All Calendar keyboard navigation works inside the popover (arrow keys, Home/End, PageUp/PageDown).

## Composition

`DatePicker` is a thin wrapper. Internally it renders:

```svelte
<Popover>
	<PopoverTrigger>...</PopoverTrigger>
	<PopoverContent class="w-auto p-0">
		<Calendar>
			<CalendarHeader />
			<CalendarGrid />
		</Calendar>
	</PopoverContent>
</Popover>
```

If you need multiple months, date ranges, or custom calendar layouts, compose `Popover` + `Calendar` directly.
