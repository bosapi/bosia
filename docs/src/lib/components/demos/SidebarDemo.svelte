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
	import { Avatar, AvatarFallback } from "$registry/avatar";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
	} from "$registry/dropdown-menu";
	import {
		Terminal,
		Package,
		Book,
		Settings,
		Hash,
		Globe,
		Map,
		EllipsisVertical,
		ChevronUp,
		LayoutDashboard,
	} from "@lucide/svelte";

	let collapsed = $state(false);
	let userMenuOpen = $state(false);
	let chevronEl: HTMLElement | undefined = $state();

	const user = {
		name: "shadcn",
		email: "m@example.com",
		avatar: "",
	};

	function handleLogout() {
		alert("Signed out (demo)");
	}
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
						<SidebarMenuItem href="#" label="Dashboard" active>
							{#snippet icon()}<LayoutDashboard size={16} />{/snippet}
						</SidebarMenuItem>
						<SidebarMenuItem label="Playground" trigger="hover">
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
				<DropdownMenu bind:open={userMenuOpen} class="block w-full">
					<DropdownMenuTrigger
						class="flex w-full items-center justify-between gap-2 rounded-md p-1 hover:bg-sidebar-accent"
					>
						<div class="flex min-w-0 items-center gap-2">
							<Avatar src={user.avatar} alt={user.name} class="h-8 w-8">
								<AvatarFallback>SH</AvatarFallback>
							</Avatar>
							{#if !collapsed}
								<div class="flex min-w-0 flex-col text-left leading-tight">
									<span class="truncate text-sm font-medium">{user.name}</span>
									<span class="truncate text-xs text-muted-foreground"
										>{user.email}</span
									>
								</div>
							{/if}
						</div>
						{#if !collapsed}
							<span
								bind:this={chevronEl}
								class="inline-flex shrink-0 items-center text-muted-foreground transition-transform duration-150"
								style:transform={userMenuOpen ? "rotate(0deg)" : "rotate(180deg)"}
							>
								<ChevronUp size={14} />
							</span>
						{/if}
					</DropdownMenuTrigger>
					<DropdownMenuContent
						floating
						side="top"
						align="end"
						anchor={chevronEl}
						class="min-w-48"
					>
						<DropdownMenuItem href="#">Profile</DropdownMenuItem>
						<DropdownMenuItem href="#">Settings</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onclick={handleLogout}>Sign out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarFooter>
		</Sidebar>

		<main class="flex-1 p-1 bg-background mt-3"></main>
	</div>
</div>
