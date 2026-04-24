<script lang="ts">
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        children,
        ...restProps
    }: {
        children?: Snippet;
        [key: string]: any;
    } = $props();

    let open = $state(false);
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    setContext("context-menu-sub", {
        get isOpen() { return open; },
        open() {
            clearTimeout(closeTimer);
            open = true;
        },
        close() {
            open = false;
        },
        delayedClose() {
            closeTimer = setTimeout(() => { open = false; }, 150);
        },
        cancelClose() {
            clearTimeout(closeTimer);
        },
    });
</script>

<div
    class="relative"
    onmouseenter={() => { clearTimeout(closeTimer); open = true; }}
    onmouseleave={() => { closeTimer = setTimeout(() => { open = false; }, 150); }}
    {...restProps}
>
    {@render children?.()}
</div>
