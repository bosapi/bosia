<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";

    type Item = {
        value: string;
        keywords: string[] | undefined;
        onSelect: (value: string) => void;
    };

    let {
        value = $bindable(undefined as string | undefined),
        class: className = "",
        filter = defaultFilter,
        children,
        ...restProps
    }: {
        value?: string;
        class?: string;
        filter?: (value: string, query: string, keywords?: string[]) => boolean;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    function defaultFilter(v: string, q: string, keywords?: string[]) {
        if (!q) return true;
        const needle = q.toLowerCase();
        if (v.toLowerCase().includes(needle)) return true;
        return keywords?.some((k) => k.toLowerCase().includes(needle)) ?? false;
    }

    let query = $state("");
    let userHighlight = $state<string | undefined>(undefined);
    const items: Item[] = $state([]);

    const visibleItems = $derived(
        items.filter((i) => filter(i.value, query, i.keywords)),
    );

    const highlightedValue = $derived.by(() => {
        if (!visibleItems.length) return undefined;
        if (
            userHighlight &&
            visibleItems.find((i) => i.value === userHighlight)
        ) {
            return userHighlight;
        }
        return visibleItems[0].value;
    });

    function moveHighlight(dir: 1 | -1 | "first" | "last") {
        if (!visibleItems.length) return;
        if (dir === "first") {
            userHighlight = visibleItems[0].value;
            return;
        }
        if (dir === "last") {
            userHighlight = visibleItems[visibleItems.length - 1].value;
            return;
        }
        const idx = visibleItems.findIndex((i) => i.value === highlightedValue);
        const nextIdx =
            idx === -1 ? 0 : (idx + dir + visibleItems.length) % visibleItems.length;
        userHighlight = visibleItems[nextIdx].value;
    }

    function selectValue(v: string) {
        const item = items.find((i) => i.value === v);
        if (!item) return;
        value = v;
        item.onSelect(v);
    }

    setContext("command", {
        get query() {
            return query;
        },
        get highlightedValue() {
            return highlightedValue;
        },
        get visibleCount() {
            return visibleItems.length;
        },
        isVisible(v: string, keywords?: string[]) {
            return filter(v, query, keywords);
        },
        setQuery(q: string) {
            query = q;
        },
        setHighlight(v: string) {
            userHighlight = v;
        },
        register(item: Item) {
            items.push(item);
        },
        unregister(v: string) {
            const idx = items.findIndex((i) => i.value === v);
            if (idx >= 0) items.splice(idx, 1);
        },
        select: selectValue,
        moveHighlight,
    });

    function onkeydown(e: KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            moveHighlight(1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            moveHighlight(-1);
        } else if (e.key === "Home") {
            e.preventDefault();
            moveHighlight("first");
        } else if (e.key === "End") {
            e.preventDefault();
            moveHighlight("last");
        } else if (e.key === "Enter") {
            if (highlightedValue) {
                e.preventDefault();
                selectValue(highlightedValue);
            }
        }
    }
</script>

<div
    class={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
    )}
    data-command
    {onkeydown}
    {...restProps}
>
    {@render children?.()}
</div>
