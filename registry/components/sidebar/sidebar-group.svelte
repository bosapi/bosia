<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        label = "",
        children,
        ...restProps
    }: {
        class?: string;
        label?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();
</script>

<div class={cn("px-2 py-2", className)} {...restProps}>
    {#if label}
        <h4 class="mb-1 truncate px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </h4>
    {/if}
    {@render children?.()}
</div>
