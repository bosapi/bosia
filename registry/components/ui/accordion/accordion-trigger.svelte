<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        level = 3,
        class: className = "",
        children,
        ...restProps
    }: {
        level?: 1 | 2 | 3 | 4 | 5 | 6;
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const item = getContext<{
        value: string;
        disabled: boolean;
        isOpen: boolean;
        dataState: "open" | "closed";
        triggerId: string;
        contentId: string;
        toggle: () => void;
    }>("accordion-item");

    function onclick() {
        if (item.disabled) return;
        item.toggle();
    }

    function onkeydown(e: KeyboardEvent) {
        const current = e.currentTarget as HTMLButtonElement;
        const root = current.closest("[data-slot='accordion']");
        if (!root) return;
        const items = Array.from(
            root.querySelectorAll<HTMLButtonElement>("button[data-slot='accordion-trigger']"),
        );
        const index = items.indexOf(current);
        let next: HTMLButtonElement | undefined;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            next = findNextEnabled(items, index, 1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            next = findNextEnabled(items, index, -1);
        } else if (e.key === "Home") {
            e.preventDefault();
            next = findNextEnabled(items, -1, 1);
        } else if (e.key === "End") {
            e.preventDefault();
            next = findNextEnabled(items, items.length, -1);
        }

        if (next) next.focus();
    }

    function findNextEnabled(
        items: HTMLButtonElement[],
        current: number,
        direction: number,
    ): HTMLButtonElement | undefined {
        const len = items.length;
        for (let i = 1; i <= len; i++) {
            const idx = (current + i * direction + len) % len;
            if (!items[idx].disabled) return items[idx];
        }
        return undefined;
    }
</script>

<svelte:element this={`h${level}`} class="flex" data-slot="accordion-header">
    <button
        type="button"
        id={item.triggerId}
        aria-expanded={item.isOpen}
        aria-controls={item.contentId}
        data-slot="accordion-trigger"
        data-state={item.dataState}
        disabled={item.disabled}
        class={cn(
            "flex flex-1 items-center justify-between gap-4 py-4 text-sm font-medium text-left transition-all outline-none",
            "hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "[&[data-state=open]>svg]:rotate-180",
            className,
        )}
        {onclick}
        {onkeydown}
        {...restProps}
    >
        {@render children?.()}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
            aria-hidden="true"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    </button>
</svelte:element>
