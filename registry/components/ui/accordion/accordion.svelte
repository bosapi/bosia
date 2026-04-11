<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";

    type AccordionType = "single" | "multiple";

    let {
        type = "single",
        value = $bindable(),
        collapsible = false,
        disabled = false,
        class: className = "",
        children,
        ...restProps
    }: {
        type?: AccordionType;
        value?: string | string[];
        collapsible?: boolean;
        disabled?: boolean;
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    if (value === undefined) {
        value = type === "multiple" ? [] : "";
    }

    const baseId = `accordion-${Math.random().toString(36).slice(2, 10)}`;

    function isOpen(itemValue: string): boolean {
        if (type === "multiple") {
            return Array.isArray(value) && value.includes(itemValue);
        }
        return value === itemValue;
    }

    function toggle(itemValue: string) {
        if (type === "multiple") {
            const arr = Array.isArray(value) ? [...value] : [];
            const idx = arr.indexOf(itemValue);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(itemValue);
            value = arr;
            return;
        }
        if (value === itemValue) {
            value = collapsible ? "" : itemValue;
        } else {
            value = itemValue;
        }
    }

    setContext("accordion", {
        get type() { return type; },
        get disabled() { return disabled; },
        baseId,
        isOpen,
        toggle,
    });
</script>

<div
    data-orientation="vertical"
    data-slot="accordion"
    class={cn(className)}
    {...restProps}
>
    {@render children?.()}
</div>
