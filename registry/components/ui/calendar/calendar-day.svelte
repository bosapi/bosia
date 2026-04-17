<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";

    let {
        class: className = "",
        date,
        outsideMonth,
        isToday,
        isSelected,
        isDisabled,
        ...restProps
    }: {
        class?: string;
        date: Date;
        outsideMonth: boolean;
        isToday: boolean;
        isSelected: boolean;
        isDisabled: boolean;
        [key: string]: any;
    } = $props();

    const calendar = getContext<{
        select: (date: Date) => void;
    }>("calendar");

    const dateStr = $derived(date.toISOString().split("T")[0]);
    const ariaLabel = $derived(date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }));
</script>

<button
    type="button"
    class={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        !isSelected && isToday && "bg-accent text-accent-foreground",
        !isSelected && !isToday && !outsideMonth && !isDisabled && "hover:bg-accent hover:text-accent-foreground",
        outsideMonth && "text-muted-foreground opacity-50",
        isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
        className,
    )}
    disabled={isDisabled}
    tabindex={isSelected || isToday ? 0 : -1}
    data-date={dateStr}
    data-selected={isSelected ? "" : undefined}
    data-today={isToday ? "" : undefined}
    data-outside-month={outsideMonth ? "" : undefined}
    data-disabled={isDisabled ? "" : undefined}
    aria-label={ariaLabel}
    onclick={() => !isDisabled && calendar.select(date)}
    {...restProps}
>
    {date.getDate()}
</button>
