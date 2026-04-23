<script lang="ts">
    import {
        NavigationMenu,
        NavigationMenuList,
        NavigationMenuItem,
        NavigationMenuTrigger,
        NavigationMenuContent,
        NavigationMenuLink,
    } from "$registry/navigation-menu";
</script>

<div class="flex items-center justify-start">
    <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
                <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul class="grid w-[480px] grid-cols-2 gap-3">
                        <li class="row-span-2">
                            <NavigationMenuLink
                                href="/"
                                class="flex h-full w-full flex-col justify-end bg-gradient-to-b from-muted/50 to-muted p-6 no-underline"
                            >
                                <div class="mt-4 mb-2 text-lg font-medium">Bosia</div>
                                <p class="text-sm leading-tight text-muted-foreground">
                                    A fullstack framework built on Bun, Svelte 5, and ElysiaJS.
                                </p>
                            </NavigationMenuLink>
                        </li>
                        <li>
                            <NavigationMenuLink href="/getting-started">
                                <div class="text-sm font-medium leading-none">Introduction</div>
                                <p class="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Install Bosia and scaffold your first app.
                                </p>
                            </NavigationMenuLink>
                        </li>
                        <li>
                            <NavigationMenuLink href="/project-structure">
                                <div class="text-sm font-medium leading-none">Project Structure</div>
                                <p class="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Learn the conventions of a Bosia app.
                                </p>
                            </NavigationMenuLink>
                        </li>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul class="grid w-[240px] gap-1">
                        <li>
                            <NavigationMenuLink href="/components/ui/button">
                                <div class="text-sm font-medium leading-none">Button</div>
                            </NavigationMenuLink>
                        </li>
                        <li>
                            <NavigationMenuLink href="/components/ui/card">
                                <div class="text-sm font-medium leading-none">Card</div>
                            </NavigationMenuLink>
                        </li>
                        <li>
                            <NavigationMenuLink href="/components/ui/dialog">
                                <div class="text-sm font-medium leading-none">Dialog</div>
                            </NavigationMenuLink>
                        </li>
                        <li>
                            <NavigationMenuLink href="/components/ui/tabs">
                                <div class="text-sm font-medium leading-none">Tabs</div>
                            </NavigationMenuLink>
                        </li>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
                <NavigationMenuLink
                    href="/"
                    class="inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                    Docs
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
</div>
