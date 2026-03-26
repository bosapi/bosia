<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        href = "/",
        label = "",
        active = false,
        children,
        ...restProps
    }: {
        class?: string;
        href?: string;
        label?: string;
        active?: boolean;
        children?: Snippet;
        [key: string]: any;
    } = $props();
</script>

<a
    {href}
    class={cn(
        "text-sm font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        className,
    )}
    aria-current={active ? "page" : undefined}
    {...restProps}
>
    {#if children}
        {@render children()}
    {:else}
        {label}
    {/if}
</a>
