<script lang="ts">
	import { RangeCalendar, RangeCalendarGrid } from "$registry/range-calendar";
	import { CalendarHeader } from "$registry/calendar";

	let value = $state<{ start?: Date; end?: Date }>({ start: undefined, end: undefined });

	const fmt = (d: Date) =>
		d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
</script>

<div class="flex flex-col items-center gap-4">
	<RangeCalendar bind:value class="rounded-md border">
		<CalendarHeader />
		<RangeCalendarGrid />
	</RangeCalendar>
	{#if value.start}
		<p class="text-sm text-muted-foreground">
			{#if value.end}
				<strong>{fmt(value.start)}</strong> &ndash; <strong>{fmt(value.end)}</strong>
			{:else}
				<strong>{fmt(value.start)}</strong> &ndash;
				<span class="italic">select end date</span>
			{/if}
		</p>
	{/if}
</div>
