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
		ChevronsUpDown,
	} from "@lucide/svelte";
	import type { SessionUser } from "../../features/auth";

	let { currentPath = "/", user }: { currentPath?: string; user: SessionUser } = $props();
	let collapsed = $state(false);

	const items = [
		{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
		{ label: "Products", href: "/dashboard/products", icon: Package },
		{ label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
		{ label: "Files", href: "/dashboard/files", icon: FolderUp },
		{ label: "Users", href: "/dashboard/users", icon: Users },
	];

	const initials = (user.email[0] ?? "?").toUpperCase();
</script>

<Sidebar bind:collapsed>
	<SidebarHeader>
		<a href="/dashboard" class="flex items-center gap-2 font-bold">
			<span class="text-lg">⬡</span>
			{#if !collapsed}<span>Shop Admin</span>{/if}
		</a>
		<SidebarTrigger class="ml-auto" />
	</SidebarHeader>

	<SidebarContent>
		<SidebarGroup>
			<SidebarMenu>
				{#each items as item}
					<SidebarMenuItem
						href={item.href}
						label={item.label}
						active={currentPath === item.href}
					>
						{#snippet icon()}<item.icon size={16} />{/snippet}
					</SidebarMenuItem>
				{/each}
			</SidebarMenu>
		</SidebarGroup>
	</SidebarContent>

	<SidebarFooter>
		<DropdownMenu floating side="top">
			<DropdownMenuTrigger
				class="bg-sidebar-accent/40 hover:bg-sidebar-accent flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors"
			>
				<Avatar class="h-7 w-7">
					<AvatarFallback class="text-xs">{initials}</AvatarFallback>
				</Avatar>
				{#if !collapsed}
					<div class="flex min-w-0 flex-1 flex-col">
						<span class="truncate text-sm font-medium">{user.email}</span>
					</div>
					<ChevronsUpDown size={14} class="text-muted-foreground shrink-0" />
				{/if}
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56" align="end">
				<DropdownMenuItem>Profile</DropdownMenuItem>
				<DropdownMenuItem>Settings</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<form method="POST" action="/logout" class="flex w-full items-center gap-2">
						<LogOut size={14} />
						<button type="submit" class="flex-1 text-left">Sign out</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarFooter>
</Sidebar>
