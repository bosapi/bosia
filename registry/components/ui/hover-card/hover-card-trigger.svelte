<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        href = undefined,
        children,
        ...restProps
    }: {
        class?: string;
        href?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const hoverCard = getContext<{
        open: boolean;
        id: string;
        show: () => void;
        hide: () => void;
    }>("hover-card");
</script>

<a
    {href}
    class={cn("inline-flex items-center", className)}
    aria-expanded={hoverCard?.open ?? false}
    aria-controls={hoverCard?.id}
    onmouseenter={() => hoverCard?.show()}
    onmouseleave={() => hoverCard?.hide()}
    onfocus={() => hoverCard?.show()}
    onblur={() => hoverCard?.hide()}
    {...restProps}
>
    {@render children?.()}
</a>
