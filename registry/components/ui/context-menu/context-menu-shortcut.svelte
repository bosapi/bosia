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

<span
    class={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
    {...restProps}
>
    {@render children?.()}
</span>
