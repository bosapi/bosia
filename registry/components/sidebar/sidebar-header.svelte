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

<div class={cn("flex items-center gap-2 border-b px-3 py-3", className)} {...restProps}>
    {@render children?.()}
</div>
