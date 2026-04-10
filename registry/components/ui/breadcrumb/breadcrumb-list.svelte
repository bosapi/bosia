<script lang="ts">
    import { cn } from "$lib/utils.ts";
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
</script>

<ol
    class={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground break-words sm:gap-2.5",
        className,
    )}
    {...restProps}
>
    {@render children?.()}
</ol>
