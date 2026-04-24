<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        disabled = false,
        onclick,
        children,
        ...restProps
    }: {
        class?: string;
        disabled?: boolean;
        onclick?: (e: MouseEvent) => void;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const ctx = getContext<{ close: () => void }>("context-menu");

    function handleClick(e: MouseEvent) {
        if (disabled) return;
        onclick?.(e);
        ctx?.close();
    }
</script>

<button
    type="button"
    role="menuitem"
    {disabled}
    class={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className,
    )}
    onclick={handleClick}
    {...restProps}
>
    {@render children?.()}
</button>
