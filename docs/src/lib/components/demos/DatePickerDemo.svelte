<script lang="ts">
    import { DatePicker } from "$registry/date-picker";

    let date = $state<Date | undefined>(undefined);
</script>

<div class="flex flex-col items-center gap-4">
    <DatePicker bind:value={date} />
    {#if date}
        <p class="text-sm text-muted-foreground">
            Selected: <strong>{date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
        </p>
    {/if}
</div>
