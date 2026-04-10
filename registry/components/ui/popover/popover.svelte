<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        open = $bindable(false),
        children,
        ...restProps
    }: {
        class?: string;
        open?: boolean;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const uid = crypto.randomUUID().slice(0, 8);
    const id = `popover-${uid}`;

    let rootEl: HTMLDivElement;

    setContext("popover", {
        get open() { return open; },
        get id() { return id; },
        toggle() { open = !open; },
        close() { open = false; },
    });

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && open) open = false;
    }

    function handleClickOutside(e: MouseEvent) {
        if (rootEl && !rootEl.contains(e.target as Node)) {
            open = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div
    bind:this={rootEl}
    class={cn("relative inline-block", className)}
    data-popover
    {...restProps}
>
    {@render children?.()}
</div>
