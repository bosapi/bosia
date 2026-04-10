<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";
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

    const popover = getContext<{
        open: boolean;
        id: string;
        toggle: () => void;
    }>("popover");
</script>

<button
    type="button"
    class={cn("inline-flex items-center justify-center", className)}
    aria-haspopup="dialog"
    aria-expanded={popover?.open ?? false}
    aria-controls={popover?.id}
    onclick={() => popover?.toggle()}
    {...restProps}
>
    {@render children?.()}
</button>
