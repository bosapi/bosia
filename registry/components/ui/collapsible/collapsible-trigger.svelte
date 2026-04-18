<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        children,
        ...restProps
    }: {
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const ctx = getContext<{
        open: boolean;
        disabled: boolean;
        dataState: "open" | "closed";
        baseId: string;
        toggle: () => void;
    }>("collapsible");

    function onclick() {
        ctx.toggle();
    }
</script>

<button
    type="button"
    id={`${ctx.baseId}-trigger`}
    aria-expanded={ctx.open}
    aria-controls={`${ctx.baseId}-content`}
    data-slot="collapsible-trigger"
    data-state={ctx.dataState}
    data-disabled={ctx.disabled || undefined}
    disabled={ctx.disabled}
    class={cn(
        "flex items-center justify-between",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
    )}
    {onclick}
    {...restProps}
>
    {@render children?.()}
</button>
