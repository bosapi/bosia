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

<div class="relative w-full overflow-auto">
    <table class={cn("w-full caption-bottom text-sm", className)} {...restProps}>
        {@render children?.()}
    </table>
</div>
