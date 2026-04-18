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
</script>

{#if ctx.open}
    <div
        role="region"
        id={`${ctx.baseId}-content`}
        aria-labelledby={`${ctx.baseId}-trigger`}
        data-slot="collapsible-content"
        data-state={ctx.dataState}
        class={cn(className)}
        {...restProps}
    >
        {@render children?.()}
    </div>
{/if}
