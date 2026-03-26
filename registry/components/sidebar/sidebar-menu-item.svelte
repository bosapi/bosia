<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        href = "",
        label = "",
        active = false,
        icon = "",
        children,
        ...restProps
    }: {
        class?: string;
        href?: string;
        label?: string;
        active?: boolean;
        icon?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    let open = $state(false);
    const hasChildren = $derived(!!children);
</script>

<li class={cn("list-none", className)} {...restProps}>
    {#if hasChildren}
        <button
            onclick={(e) => { e.preventDefault(); open = !open; }}
            class={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
        >
            {#if icon}
                <span class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>
            {/if}
            <span class="flex-1 truncate text-left">{label}</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class={cn("shrink-0 transition-transform", open && "rotate-180")}
            >
                <path d="m6 9 6 6 6-6" />
            </svg>
        </button>
        {#if open}
            <ul class="ml-4 mt-0.5 flex flex-col gap-0.5 border-l pl-2">
                {@render children()}
            </ul>
        {/if}
    {:else if href}
        <a
            {href}
            class={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
            )}
        >
            {#if icon}
                <span class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>
            {/if}
            <span class="truncate">{label}</span>
        </a>
    {:else}
        <span class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground">
            {#if icon}
                <span class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>
            {/if}
            <span class="truncate">{label}</span>
        </span>
    {/if}
</li>
