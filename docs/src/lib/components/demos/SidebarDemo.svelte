<script lang="ts">
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarMenu,
		SidebarMenuItem,
		SidebarFooter,
		SidebarTrigger,
	} from "$registry/sidebar";
	import {
		Terminal,
		Package,
		Book,
		Settings,
		Hash,
		Globe,
		Map,
		EllipsisVertical,
		User,
		ChevronUp,
	} from "@lucide/svelte";

	let collapsed = $state(false);
</script>

<div class="w-full rounded-lg border overflow-hidden" style="height: 460px;">
	<div class="flex h-full">
		<Sidebar collapsible="icon" bind:collapsed class="bg-primary-foreground">
			<SidebarHeader class={collapsed ? "px-2" : "pl-4"}>
				<div class="flex items-center gap-2 w-full justify-center">
					<button
						onclick={() => (collapsed = !collapsed)}
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-primary border"
					>
						<img src="/logo-dark.svg" alt="Bosia" class="hidden dark:block" />
						<img src="/logo-light.svg" alt="Bosia" class="block dark:hidden" />
					</button>
					{#if !collapsed}
						<div class="flex items-center justify-between w-full">
							<div class="flex flex-1 flex-col leading-tight">
								<span class="text-sm font-semibold">Acme Inc</span>
								<span class="text-xs text-muted-foreground">Enterprise</span>
							</div>
							<SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />
						</div>
					{/if}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup label="Platform">
					<SidebarMenu>
						<SidebarMenuItem label="Playground" active trigger="hover">
							{#snippet icon()}<Terminal size={16} />{/snippet}
							<SidebarMenuItem href="#" label="History" />
							<SidebarMenuItem href="#" label="Starred" />
							<SidebarMenuItem href="#" label="Settings" />
						</SidebarMenuItem>
						<SidebarMenuItem label="Models" trigger="hover">
							{#snippet icon()}<Package size={16} />{/snippet}
							<SidebarMenuItem href="#" label="Genesis" />
							<SidebarMenuItem href="#" label="Explorer" />
							<SidebarMenuItem href="#" label="Quantum" />
						</SidebarMenuItem>
						<SidebarMenuItem label="Documentation" trigger="hover">
							{#snippet icon()}<Book size={16} />{/snippet}
							<SidebarMenuItem href="#" label="Introduction" />
							<SidebarMenuItem href="#" label="Get Started" />
							<SidebarMenuItem href="#" label="Tutorials" />
							<SidebarMenuItem href="#" label="Changelog" />
						</SidebarMenuItem>
						<SidebarMenuItem label="Settings" trigger="hover">
							{#snippet icon()}<Settings size={16} />{/snippet}
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
							{#snippet icon()}<Hash size={16} />{/snippet}
						</SidebarMenuItem>
						<SidebarMenuItem href="#" label="Sales & Marketing">
							{#snippet icon()}<Globe size={16} />{/snippet}
						</SidebarMenuItem>
						<SidebarMenuItem href="#" label="Travel">
							{#snippet icon()}<Map size={16} />{/snippet}
						</SidebarMenuItem>
						<SidebarMenuItem href="#" label="More">
							{#snippet icon()}<EllipsisVertical size={16} />{/snippet}
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<div class="flex items-center gap-2">
					<div
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted"
					>
						<User size={14} class="text-muted-foreground" />
					</div>
					{#if !collapsed}
						<div class="flex flex-1 flex-col leading-tight">
							<span class="text-sm font-medium">shadcn</span>
							<span class="text-xs text-muted-foreground">m@example.com</span>
						</div>
						<ChevronUp size={14} class="text-muted-foreground" />
					{/if}
				</div>
			</SidebarFooter>
		</Sidebar>

		<main class="flex-1 p-1 bg-background mt-3"></main>
	</div>
</div>
