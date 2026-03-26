<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { Icon } from "$lib/components/ui/icon";
    import {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
    } from "$lib/components/ui/dropdown-menu";

    let {
        class: className = "",
        links = [] as { label: string; href: string }[],
        currentPath = "/",
        ...restProps
    }: {
        class?: string;
        links?: { label: string; href: string }[];
        currentPath?: string;
        [key: string]: any;
    } = $props();

    let menuOpen = $state(false);
</script>

<div class={cn("md:hidden", className)} {...restProps}>
    <DropdownMenu bind:open={menuOpen}>
        <DropdownMenuTrigger
            aria-label="Open menu"
            class="h-9 w-9 hover:bg-accent rounded-md"
        >
            <Icon name={menuOpen ? "x" : "menu"} size={20} />
        </DropdownMenuTrigger>

        {#if menuOpen}
            <DropdownMenuContent align="start" class="w-48">
                {#each links as link}
                    <DropdownMenuItem onclick={() => (menuOpen = false)}>
                        <a
                            href={link.href}
                            class={cn(
                                "block w-full text-sm",
                                currentPath === link.href
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground",
                            )}
                        >
                            {link.label}
                        </a>
                    </DropdownMenuItem>
                {/each}
            </DropdownMenuContent>
        {/if}
    </DropdownMenu>
</div>
