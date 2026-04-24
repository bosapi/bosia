<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        children,
        orientation = "vertical",
        ...restProps
    }: {
        class?: string;
        children?: Snippet;
        orientation?: "vertical" | "horizontal" | "both";
        [key: string]: any;
    } = $props();

    const overflowClass = {
        vertical: "overflow-y-auto overflow-x-hidden",
        horizontal: "overflow-x-auto overflow-y-hidden",
        both: "overflow-auto",
    };
</script>

<div
    class={cn("relative", overflowClass[orientation], className)}
    {...restProps}
>
    {@render children?.()}
</div>

<style>
    div {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--border)) transparent;
    }
    div::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    div::-webkit-scrollbar-track {
        background: transparent;
    }
    div::-webkit-scrollbar-thumb {
        background-color: hsl(var(--border));
        border-radius: 9999px;
        border: 2px solid transparent;
        background-clip: content-box;
    }
    div::-webkit-scrollbar-thumb:hover {
        background-color: hsl(var(--muted-foreground));
    }
    div::-webkit-scrollbar-corner {
        background: transparent;
    }
</style>
