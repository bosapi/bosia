<!-- EDIT THIS FILE: rename items, add sections, change icons. -->
<script lang="ts">
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarMenu,
		SidebarMenuItem,
		SidebarTrigger,
	} from "$lib/components/ui/sidebar";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
	} from "$lib/components/ui/dropdown-menu";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
	import {
		LayoutDashboard,
		Package,
		ShoppingCart,
		FolderUp,
		Users,
		LogOut,
		ChevronUp,
	} from "@lucide/svelte";
	import type { SessionUser } from "../../features/auth";

	let { currentPath = "/", user }: { currentPath?: string; user: SessionUser } = $props();
	let collapsed = $state(false);
	let userMenuOpen = $state(false);
	let chevronEl: HTMLElement | undefined = $state();

	type LeafItem = { label: string; href: string; icon: typeof LayoutDashboard };
	type ParentItem = { label: string; icon: typeof LayoutDashboard; children: LeafItem[] };
	type Item = LeafItem | ParentItem;

	const items: Item[] = [
		{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
		{ label: "Products", href: "/dashboard/products", icon: Package },
		{
			label: "Orders",
			icon: ShoppingCart,
			children: [
				{ label: "All orders", href: "/dashboard/orders", icon: ShoppingCart },
				{ label: "Pending", href: "/dashboard/orders/pending", icon: ShoppingCart },
				{ label: "Refunds", href: "/dashboard/orders/refunds", icon: ShoppingCart },
			],
		},
		{ label: "Files", href: "/dashboard/files", icon: FolderUp },
		{ label: "Users", href: "/dashboard/users", icon: Users },
	];

	const isParent = (i: Item): i is ParentItem => "children" in i;

	const initials = (user.email[0] ?? "?").toUpperCase();
</script>

<Sidebar bind:collapsed>
	<SidebarHeader class={collapsed ? "px-2" : "pl-4"}>
		<div class="flex w-full items-center justify-center gap-2">
			<button
				onclick={() => (collapsed = !collapsed)}
				class="border-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
				aria-label="Toggle sidebar"
			>
				<img src="/logo-dark.svg" alt="Bosia" class="hidden h-5 w-5 dark:block" />
				<img src="/logo-light.svg" alt="Bosia" class="block h-5 w-5 dark:hidden" />
			</button>
			{#if !collapsed}
				<div class="flex w-full items-center justify-between">
					<div class="flex flex-1 flex-col leading-tight">
						<span class="text-sm font-semibold">Shop Admin</span>
						<span class="text-muted-foreground text-xs">Storefront</span>
					</div>
					<SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />
				</div>
			{/if}
		</div>
	</SidebarHeader>

	<SidebarContent>
		<SidebarGroup>
			<SidebarMenu>
				{#each items as item}
					{#if isParent(item)}
						<SidebarMenuItem label={item.label}>
							{#snippet icon()}<item.icon size={16} />{/snippet}
							{#each item.children as child}
								<SidebarMenuItem
									href={child.href}
									label={child.label}
									active={currentPath === child.href}
								/>
							{/each}
						</SidebarMenuItem>
					{:else}
						<SidebarMenuItem href={item.href} label={item.label} active={currentPath === item.href}>
							{#snippet icon()}<item.icon size={16} />{/snippet}
						</SidebarMenuItem>
					{/if}
				{/each}
			</SidebarMenu>
		</SidebarGroup>
	</SidebarContent>

	<SidebarFooter>
		<DropdownMenu bind:open={userMenuOpen} class="block w-full">
			<DropdownMenuTrigger
				class="hover:bg-sidebar-accent flex w-full items-center justify-between gap-2 rounded-md p-1"
			>
				<div class="flex min-w-0 items-center gap-2">
					<Avatar class="h-8 w-8">
						<AvatarFallback class="text-xs">{initials}</AvatarFallback>
					</Avatar>
					{#if !collapsed}
						<div class="flex min-w-0 flex-col text-left leading-tight">
							<span class="truncate text-sm font-medium">{user.email}</span>
						</div>
					{/if}
				</div>
				{#if !collapsed}
					<span
						bind:this={chevronEl}
						class="text-muted-foreground inline-flex shrink-0 items-center transition-transform duration-150"
						style:transform={userMenuOpen ? "rotate(0deg)" : "rotate(180deg)"}
					>
						<ChevronUp size={14} />
					</span>
				{/if}
			</DropdownMenuTrigger>
			<DropdownMenuContent floating side="top" align="end" anchor={chevronEl} class="min-w-48">
				<DropdownMenuItem href="/dashboard/profile">Profile</DropdownMenuItem>
				<DropdownMenuItem href="/dashboard/settings">Settings</DropdownMenuItem>
				<DropdownMenuSeparator />
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
					>
						<LogOut size={14} />
						<span>Sign out</span>
					</button>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarFooter>
</Sidebar>
