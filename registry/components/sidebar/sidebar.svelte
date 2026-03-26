<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        side = "left" as "left" | "right",
        collapsible = "icon" as "icon" | "none",
        collapsed = $bindable(false),
        children,
        ...restProps
    }: {
        class?: string;
        side?: "left" | "right";
        collapsible?: "icon" | "none";
        collapsed?: boolean;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    function toggle() {
        if (collapsible === "none") return;
        collapsed = !collapsed;
    }
</script>

<aside
    class={cn(
        "relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        side === "right" && "order-last border-l border-r-0",
        collapsed
            ? "w-[var(--sidebar-width-icon,3rem)]"
            : "w-[var(--sidebar-width,16rem)]",
        className,
    )}
    data-collapsed={collapsed}
    {...restProps}
>
    {@render children?.()}

    {#if collapsible === "icon"}
        <button
            onclick={toggle}
            class={cn(
                "absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors",
                side === "right" && "-left-3 right-auto",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class={cn(
                    "transition-transform",
                    collapsed
                        ? side === "right" ? "-rotate-90" : "rotate-90"
                        : side === "right" ? "rotate-90" : "-rotate-90",
                )}
            >
                <path d="m6 9 6 6 6-6" />
            </svg>
        </button>
    {/if}
</aside>
