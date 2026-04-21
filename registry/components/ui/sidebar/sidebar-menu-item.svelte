<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";
    import { getSidebarContext } from "./context.ts";

    let {
        class: className = "",
        href = "",
        label = "",
        active = false,
        icon,
        children,
        ...restProps
    }: {
        class?: string;
        href?: string;
        label?: string;
        active?: boolean;
        icon?: Snippet;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const sidebar = getSidebarContext();

    let open = $state(false);
    const hasChildren = $derived(!!children);
</script>

<li class={cn("list-none", className)} {...restProps}>
    {#if hasChildren}
        <button
            onclick={(e) => {
                e.preventDefault();
                if (!sidebar.collapsed) open = !open;
            }}
            class={cn(
                "flex w-full items-center rounded-md py-1.5 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
                sidebar.collapsed ? "justify-center px-0" : "gap-2 px-2",
            )}
        >
            {#if icon}
                <span
                    class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
                    >{@render icon()}</span
                >
            {/if}
            {#if !sidebar.collapsed}
                <span class="flex-1 truncate text-left">{label}</span>
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
                        "shrink-0 transition-transform",
                        open && "rotate-180",
                    )}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            {/if}
        </button>
        {#if open && !sidebar.collapsed}
            <ul class="ml-4 mt-0.5 flex flex-col gap-0.5 border-l pl-2">
                {@render children()}
            </ul>
        {/if}
    {:else if href}
        <a
            {href}
            class={cn(
                "flex items-center rounded-md py-1.5 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
                sidebar.collapsed ? "justify-center px-0" : "gap-2 px-2",
            )}
        >
            {#if icon}
                <span
                    class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
                    >{@render icon()}</span
                >
            {/if}
            {#if !sidebar.collapsed}
                <span class="truncate">{label}</span>
            {/if}
        </a>
    {:else}
        <span
            class={cn(
                "flex items-center rounded-md py-1.5 text-sm text-sidebar-foreground",
                sidebar.collapsed ? "justify-center px-0" : "gap-2 px-2",
            )}
        >
            {#if icon}
                <span
                    class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
                    >{@render icon()}</span
                >
            {/if}
            {#if !sidebar.collapsed}
                <span class="truncate">{label}</span>
            {/if}
        </span>
    {/if}
</li>
