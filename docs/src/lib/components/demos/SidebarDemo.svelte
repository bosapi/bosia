<script lang="ts">
    import {
        Sidebar, SidebarHeader, SidebarContent,
        SidebarGroup, SidebarMenu, SidebarMenuItem,
        SidebarFooter, SidebarTrigger,
    } from "$registry/sidebar";
    import { Icon } from "$registry/icon";

    let collapsed = $state(false);
</script>

<div class="w-full rounded-lg border overflow-hidden" style="height: 460px;">
    <div class="flex h-full">
        <Sidebar collapsible="icon" bind:collapsed>
            <SidebarHeader class={collapsed ? "px-3" : "px-4"}>
                <div class="flex items-center gap-2 w-full">
                    <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-primary border">
                        <img src="/logo-dark.svg" alt="Bosia" class="hidden h-5 w-5 dark:block" />
                        <img src="/logo-light.svg" alt="Bosia" class="block h-5 w-5 dark:hidden" />
                    </div>
                    {#if !collapsed}
                        <div class="flex items-center justify-between w-full">
                            <div class="flex flex-1 flex-col leading-tight">
                                <span class="text-sm font-semibold">Acme Inc</span>
                                <span class="text-xs text-muted-foreground">Enterprise</span>
                            </div>
                            <Icon name="chevron-down" size={14} class="text-muted-foreground" />
                        </div>
                    {/if}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup label="Platform">
                    <SidebarMenu>
                        <SidebarMenuItem label="Playground" active>
                            {#snippet icon()}<Icon name="terminal" size={16} />{/snippet}
                            <SidebarMenuItem href="#" label="History" />
                            <SidebarMenuItem href="#" label="Starred" />
                            <SidebarMenuItem href="#" label="Settings" />
                        </SidebarMenuItem>
                        <SidebarMenuItem label="Models">
                            {#snippet icon()}<Icon name="package" size={16} />{/snippet}
                            <SidebarMenuItem href="#" label="Genesis" />
                            <SidebarMenuItem href="#" label="Explorer" />
                            <SidebarMenuItem href="#" label="Quantum" />
                        </SidebarMenuItem>
                        <SidebarMenuItem label="Documentation">
                            {#snippet icon()}<Icon name="book" size={16} />{/snippet}
                            <SidebarMenuItem href="#" label="Introduction" />
                            <SidebarMenuItem href="#" label="Get Started" />
                            <SidebarMenuItem href="#" label="Tutorials" />
                            <SidebarMenuItem href="#" label="Changelog" />
                        </SidebarMenuItem>
                        <SidebarMenuItem label="Settings">
                            {#snippet icon()}<Icon name="settings" size={16} />{/snippet}
                            <SidebarMenuItem href="#" label="General" />
                            <SidebarMenuItem href="#" label="Team" />
                            <SidebarMenuItem href="#" label="Billing" />
                            <SidebarMenuItem href="#" label="Limits" />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup label="Projects">
                    <SidebarMenu>
                        <SidebarMenuItem href="#" label="Design Engineering">
                            {#snippet icon()}<Icon name="hash" size={16} />{/snippet}
                        </SidebarMenuItem>
                        <SidebarMenuItem href="#" label="Sales & Marketing">
                            {#snippet icon()}<Icon name="globe" size={16} />{/snippet}
                        </SidebarMenuItem>
                        <SidebarMenuItem href="#" label="Travel">
                            {#snippet icon()}<Icon name="map" size={16} />{/snippet}
                        </SidebarMenuItem>
                        <SidebarMenuItem href="#" label="More">
                            {#snippet icon()}<Icon name="ellipsis-vertical" size={16} />{/snippet}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div class="flex items-center gap-2">
                    <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon name="user" size={14} class="text-muted-foreground" />
                    </div>
                    {#if !collapsed}
                        <div class="flex flex-1 flex-col leading-tight">
                            <span class="text-sm font-medium">shadcn</span>
                            <span class="text-xs text-muted-foreground">m@example.com</span>
                        </div>
                        <Icon name="chevron-up" size={14} class="text-muted-foreground" />
                    {/if}
                </div>
            </SidebarFooter>
        </Sidebar>

        <main class="flex-1 p-1 bg-background mt-3">
            <div class="flex items-center gap-2 mb-4">
                <SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />
                <span class="text-sm text-muted-foreground">Toggle sidebar</span>
            </div>
        </main>
    </div>
</div>
