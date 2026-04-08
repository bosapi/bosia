<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        for: htmlFor = undefined as string | undefined,
        children,
        ...restProps
    }: {
        class?: string;
        for?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();
</script>

<label
    for={htmlFor}
    class={cn(
        "flex items-center gap-2 text-sm font-medium leading-none select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
    )}
    {...restProps}
>
    {@render children?.()}
</label>
