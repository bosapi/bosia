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

<ul
    class={cn(
        "group flex flex-1 list-none items-center justify-center space-x-1",
        className,
    )}
    {...restProps}
>
    {@render children?.()}
</ul>
