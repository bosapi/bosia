<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        heading = undefined as string | undefined,
        class: className = "",
        children,
        ...restProps
    }: {
        heading?: string;
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();
</script>

<div
    role="group"
    class={cn("command-group overflow-hidden p-1 text-foreground", className)}
    {...restProps}
>
    {#if heading}
        <div
            class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
        >
            {heading}
        </div>
    {/if}
    {@render children?.()}
</div>

<style>
    .command-group:not(:has([role="option"]:not([hidden]))) {
        display: none;
    }
</style>
