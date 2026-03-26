<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuSeparator,
    } from "$lib/components/ui/dropdown-menu";
    import { Icon } from "$lib/components/ui/icon";
    import NavbarLink from "./navbar-link.svelte";
    import NavbarMobileMenu from "./navbar-mobile-menu.svelte";

    let {
        class: className = "",
        brand = "Bosia",
        version = "",
        links = [] as { label: string; href: string }[],
        currentPath = "/",
        user = undefined as { name: string; email: string; initials: string } | undefined,
        children,
        ...restProps
    }: {
        class?: string;
        brand?: string;
        version?: string;
        links?: { label: string; href: string }[];
        currentPath?: string;
        user?: { name: string; email: string; initials: string };
        children?: Snippet;
        [key: string]: any;
    } = $props();

    let isDark = $state(false);

    function toggleDark() {
        isDark = !isDark;
        if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", isDark);
        }
    }
</script>

<nav
    class={cn(
        "sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 md:px-6",
        "bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className,
    )}
    {...restProps}
>
    <!-- Left: Mobile menu + Brand -->
    <div class="flex items-center gap-3">
        <NavbarMobileMenu {links} {currentPath} />

        <a href="/" class="flex items-center gap-2">
            <span class="text-xl font-bold">⬡ {brand}</span>
            {#if version}
                <span
                    class="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded"
                >
                    {version}
                </span>
            {/if}
        </a>
    </div>

    <!-- Center: Desktop nav links -->
    <div class="hidden md:flex items-center gap-6">
        {#each links as link}
            <NavbarLink
                href={link.href}
                label={link.label}
                active={currentPath === link.href}
            />
        {/each}
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
        {@render children?.()}

        <Button
            variant="ghost"
            size="icon"
            onclick={toggleDark}
            aria-label="Toggle theme"
        >
            <Icon name={isDark ? "sun" : "moon"} size={18} />
        </Button>

        {#if user}
            <DropdownMenu>
                <DropdownMenuTrigger aria-label="User menu">
                    <Avatar class="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarFallback class="text-xs">{user.initials}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" class="w-56">
                    <div class="flex items-center gap-2 p-2">
                        <Avatar class="h-8 w-8">
                            <AvatarFallback class="text-xs">{user.initials}</AvatarFallback>
                        </Avatar>
                        <div class="flex flex-col space-y-0.5">
                            <p class="text-sm font-medium leading-none">{user.name}</p>
                            <p class="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-destructive">Log out</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        {/if}
    </div>
</nav>
