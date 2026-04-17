<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";

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
        min: Date | undefined;
        max: Date | undefined;
        setMonth: (m: number) => void;
        setYear: (y: number) => void;
        prevMonth: () => void;
        nextMonth: () => void;
    }>("calendar");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const yearRange = $derived.by(() => {
        const center = calendar.viewedYear;
        const minYear = calendar.min ? calendar.min.getFullYear() : center - 10;
        const maxYear = calendar.max ? calendar.max.getFullYear() : center + 10;
        const years: number[] = [];
        for (let y = minYear; y <= maxYear; y++) years.push(y);
        return years;
    });

    const canPrev = $derived.by(() => {
        if (!calendar.min) return true;
        const prevDate = new Date(calendar.viewedYear, calendar.viewedMonth - 1, 1);
        return prevDate >= new Date(calendar.min.getFullYear(), calendar.min.getMonth(), 1);
    });

    const canNext = $derived.by(() => {
        if (!calendar.max) return true;
        const nextDate = new Date(calendar.viewedYear, calendar.viewedMonth + 1, 1);
        return nextDate <= new Date(calendar.max.getFullYear(), calendar.max.getMonth(), 1);
    });
</script>

<div
    class={cn("flex items-center justify-between gap-1 pb-2", className)}
    data-calendar-header
    {...restProps}
>
    <button
        type="button"
        class={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !canPrev && "pointer-events-none opacity-50",
        )}
        disabled={!canPrev}
        aria-label="Previous month"
        onclick={() => calendar.prevMonth()}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>

    <div class="flex items-center gap-1">
        <select
            class="h-7 appearance-none rounded-md bg-transparent px-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="Select month"
            value={calendar.viewedMonth}
            onchange={(e) => calendar.setMonth(Number(e.currentTarget.value))}
        >
            {#each months as m, i}
                <option value={i}>{m}</option>
            {/each}
        </select>
        <select
            class="h-7 appearance-none rounded-md bg-transparent px-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="Select year"
            value={calendar.viewedYear}
            onchange={(e) => calendar.setYear(Number(e.currentTarget.value))}
        >
            {#each yearRange as y}
                <option value={y}>{y}</option>
            {/each}
        </select>
    </div>

    <button
        type="button"
        class={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !canNext && "pointer-events-none opacity-50",
        )}
        disabled={!canNext}
        aria-label="Next month"
        onclick={() => calendar.nextMonth()}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
</div>
