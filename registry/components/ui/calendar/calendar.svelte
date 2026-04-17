<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        value = $bindable<Date | undefined>(undefined),
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
        value?: Date | undefined;
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

    let viewedYear = $state(month?.getFullYear() ?? value?.getFullYear() ?? today.getFullYear());
    let viewedMonth = $state(month?.getMonth() ?? value?.getMonth() ?? today.getMonth());

    // Sync when controlled month prop changes
    $effect(() => {
        if (month) {
            viewedYear = month.getFullYear();
            viewedMonth = month.getMonth();
        }
    });

    function select(date: Date) {
        value = new Date(date);
        value.setHours(0, 0, 0, 0);
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

    setContext("calendar", {
        get viewedMonth() { return viewedMonth; },
        get viewedYear() { return viewedYear; },
        get value() { return value; },
        get today() { return today; },
        get min() { return min; },
        get max() { return max; },
        get weekStartsOn() { return weekStartsOn; },
        get fixedWeeks() { return fixedWeeks; },
        get disabled() { return disabled; },
        select,
        setMonth: setViewMonth,
        setYear: setViewYear,
        prevMonth,
        nextMonth,
    });
</script>

<div
    class={cn("p-3", className)}
    data-calendar
    {...restProps}
>
    {@render children?.()}
</div>
