<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext, setContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        value,
        disabled = false,
        class: className = "",
        children,
        ...restProps
    }: {
        value: string;
        disabled?: boolean;
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const accordion = getContext<{
        type: "single" | "multiple";
        disabled: boolean;
        baseId: string;
        isOpen: (v: string) => boolean;
        toggle: (v: string) => void;
    }>("accordion");

    const isOpen = $derived(accordion.isOpen(value));
    const isDisabled = $derived(disabled || accordion.disabled);
    const dataState = $derived(isOpen ? "open" : "closed");
    const triggerId = $derived(`${accordion.baseId}-trigger-${value}`);
    const contentId = $derived(`${accordion.baseId}-content-${value}`);

    setContext("accordion-item", {
        get value() { return value; },
        get disabled() { return isDisabled; },
        get isOpen() { return isOpen; },
        get dataState() { return dataState; },
        get triggerId() { return triggerId; },
        get contentId() { return contentId; },
        toggle: () => accordion.toggle(value),
    });
</script>

<div
    data-slot="accordion-item"
    data-state={dataState}
    data-disabled={isDisabled ? "" : undefined}
    data-orientation="vertical"
    class={cn("border-b last:border-b-0", className)}
    {...restProps}
>
    {@render children?.()}
</div>
