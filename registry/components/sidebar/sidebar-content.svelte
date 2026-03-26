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

<div class={cn("flex-1 overflow-y-auto overflow-x-hidden py-2", className)} {...restProps}>
    {@render children?.()}
</div>
