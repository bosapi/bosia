<script lang="ts">
    import { Calendar, CalendarHeader, CalendarGrid } from "$registry/calendar";

    let selected = $state<Date | undefined>(undefined);
</script>

<div class="flex flex-col items-center gap-4">
    <Calendar bind:value={selected} class="rounded-md border">
        <CalendarHeader />
        <CalendarGrid />
    </Calendar>
    {#if selected}
        <p class="text-sm text-muted-foreground">
            Selected: <strong>{selected.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
        </p>
    {/if}
</div>
