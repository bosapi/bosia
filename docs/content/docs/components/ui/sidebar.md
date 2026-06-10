---
title: Sidebar
description: A composable sidebar with header, content, groups, menus, and collapsible icon mode.
demo: SidebarDemo
---

```bash
bun x bosia@latest add sidebar
```

A composable sidebar with header, scrollable content, grouped menus, collapsible items, and icon-mode collapse. Uses `sidebar-*` CSS custom properties for theming.

## Preview

## Basic Usage

```svelte
<script lang="ts">
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarMenu,
		SidebarMenuItem,
		SidebarFooter,
	} from "$lib/components/ui/sidebar";
</script>

<div class="flex h-screen">
	<Sidebar>
		<SidebarHeader>
			<div class="flex items-center gap-2">
				<img src="/logo-dark.svg" alt="Bosia" class="hidden h-5 w-5 dark:block" />
				<img src="/logo-light.svg" alt="Bosia" class="block h-5 w-5 dark:hidden" />
				<span class="text-lg font-bold">Bosia</span>
			</div>
		</SidebarHeader>

		<SidebarContent>
			<SidebarGroup label="Navigation">
				<SidebarMenu>
					<SidebarMenuItem href="/" label="Home" active />
					<SidebarMenuItem href="/dashboard" label="Dashboard" />
					<SidebarMenuItem href="/settings" label="Settings" />
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<p class="text-xs text-muted-foreground">v0.1.0</p>
		</SidebarFooter>
	</Sidebar>

	<main class="flex-1 p-6">
		<!-- Page content -->
	</main>
</div>
```

## Choosing the right item shape

`SidebarMenuItem` auto-branches on its props — you don't pick a different component for leaves vs. parents. Pick the shape from what the item needs to do:

| Use case                                               | Pattern                                                                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plain link (Dashboard, Settings)                       | `<SidebarMenuItem href="/x" label="X" />` — pass `href`, no children.                                                                                      |
| Section with sub-pages (Analytics → Overview, Reports) | `<SidebarMenuItem label="X">…nested items…</SidebarMenuItem>` — pass children, no `href`. Auto-renders as accordion when expanded, popover when collapsed. |
| Label-only (group hint, no nav)                        | `<SidebarMenuItem label="X" />` — no `href`, no children.                                                                                                  |

> **Never wrap a `SidebarMenuItem` in a `DropdownMenu` or any other trigger.** The component handles parent/leaf branching internally — wrapping a leaf in `DropdownMenu` swallows the `href` and breaks the link.

## Sub-components

| Component         | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `Sidebar`         | Root container with collapse support                         |
| `SidebarHeader`   | Top section with border-bottom                               |
| `SidebarContent`  | Scrollable middle area                                       |
| `SidebarFooter`   | Bottom section with border-top                               |
| `SidebarGroup`    | Groups items under an optional uppercase label               |
| `SidebarMenu`     | `<ul>` wrapper for menu items                                |
| `SidebarMenuItem` | Link, button, or static text item with optional icon snippet |
| `SidebarTrigger`  | Toggle button — place in your main content area              |

## Sidebar Props

| Prop          | Type                  | Default  |
| ------------- | --------------------- | -------- |
| `side`        | `"left"` \| `"right"` | `"left"` |
| `collapsible` | `"icon"` \| `"none"`  | `"icon"` |
| `collapsed`   | `boolean` (bindable)  | `false`  |

## Collapsible Menu Items

`SidebarMenuItem` supports nested children for collapsible sub-menus:

```svelte
<SidebarMenuItem label="Analytics">
	<SidebarMenuItem href="/analytics/overview" label="Overview" />
	<SidebarMenuItem href="/analytics/reports" label="Reports" />
</SidebarMenuItem>
```

### Icon Snippet

The `icon` prop accepts a Svelte snippet:

```svelte
<SidebarMenuItem href="/" label="Home" active>
	{#snippet icon()}
		<Icon name="home" size={16} />
	{/snippet}
</SidebarMenuItem>
```

## Collapsed Popover Sub-Menus

When the sidebar is collapsed to icon mode, parent menu items (those with children) show a **popover** on click instead of the inline accordion. The popover appears to the right with the item label as a header and all children rendered as expanded links. Click outside or press Escape to dismiss.

This behavior is automatic — no extra props needed.

### Hover Trigger

Set `trigger="hover"` on a `SidebarMenuItem` to open its collapsed popover on hover instead of click. The popover stays open while the cursor is over the trigger or the popover content, and closes after a short delay when the cursor leaves. On touch devices, hover mode degrades to tap-to-toggle.

```svelte
<SidebarMenuItem label="Models" trigger="hover">
	{#snippet icon()}<Icon name="package" size={16} />{/snippet}
	<SidebarMenuItem href="#" label="Genesis" />
	<SidebarMenuItem href="#" label="Explorer" />
</SidebarMenuItem>
```

| Prop      | Type                   | Default   |
| --------- | ---------------------- | --------- |
| `trigger` | `"click"` \| `"hover"` | `"click"` |

## User Footer

Put the signed-in user at the bottom of the sidebar. Static variant — avatar + name + email row that collapses to just the avatar in icon mode. Use `getSidebarContext()` to read `collapsed`:

```svelte
<script lang="ts">
	import { SidebarFooter, getSidebarContext } from "$lib/components/ui/sidebar";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";

	let { user }: { user: { name: string; email: string; avatar?: string } } = $props();
	const sidebar = getSidebarContext();
</script>

<SidebarFooter>
	<div class="flex items-center gap-2">
		<Avatar src={user.avatar} alt={user.name}>
			<AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
		{#if !sidebar.collapsed}
			<div class="flex flex-1 flex-col leading-tight">
				<span class="text-sm font-medium">{user.name}</span>
				<span class="text-xs text-muted-foreground">{user.email}</span>
			</div>
		{/if}
	</div>
</SidebarFooter>
```

## User Menu (Profile / Logout)

Compose `SidebarFooter` with `DropdownMenu` so the user row is a real menu trigger — Profile / Settings / Sign out.

> **Use `floating` and `side="top"` on `DropdownMenuContent`.** The default absolute positioning is clipped by `Sidebar`'s `overflow-hidden`. `floating` switches the menu to `position: fixed` (computed from the trigger rect) so it escapes the sidebar bounds, and `side="top"` opens it upward — away from the bottom edge.

```svelte
<script lang="ts">
	import { SidebarFooter, getSidebarContext } from "$lib/components/ui/sidebar";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
	} from "$lib/components/ui/dropdown-menu";
	import { ChevronUp } from "@lucide/svelte";

	let {
		user,
		onLogout,
	}: {
		user: { name: string; email: string; avatar?: string };
		onLogout: () => void;
	} = $props();

	const sidebar = getSidebarContext();
	let open = $state(false);
	let chevronEl: HTMLElement | undefined = $state();
</script>

<SidebarFooter>
	<DropdownMenu bind:open class="block w-full">
		<DropdownMenuTrigger
			class="flex w-full items-center justify-between gap-2 rounded-md p-1 hover:bg-sidebar-accent"
		>
			<div class="flex min-w-0 items-center gap-2">
				<Avatar src={user.avatar} alt={user.name} class="h-8 w-8">
					<AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
				{#if !sidebar.collapsed}
					<div class="flex min-w-0 flex-col text-left leading-tight">
						<span class="truncate text-sm font-medium">{user.name}</span>
						<span class="truncate text-xs text-muted-foreground">{user.email}</span>
					</div>
				{/if}
			</div>
			{#if !sidebar.collapsed}
				<span
					bind:this={chevronEl}
					class="inline-flex shrink-0 items-center text-muted-foreground transition-transform duration-150"
					style:transform={open ? "rotate(0deg)" : "rotate(180deg)"}
				>
					<ChevronUp size={14} />
				</span>
			{/if}
		</DropdownMenuTrigger>
		<DropdownMenuContent floating side="top" align="end" anchor={chevronEl} class="min-w-48">
			<DropdownMenuItem href="/profile">Profile</DropdownMenuItem>
			<DropdownMenuItem href="/settings">Settings</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={onLogout}>Sign out</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</SidebarFooter>
```

What's load-bearing here:

- **`class="block w-full"` on `DropdownMenu`** — the root is `inline-block` by default, so the inner trigger's `w-full` collapses to content-width. Override with `block w-full` so the trigger actually spans the footer; only then does `justify-between` push the chevron to the right edge.
- **`justify-between` on the trigger** with two children (avatar+text group, chevron) spaces them to opposite edges. `min-w-0` + `truncate` on the inner flexes keeps long emails from pushing the chevron offscreen.
- **`anchor={chevronEl}` on `DropdownMenuContent`** — by default the menu positions from the trigger button's rect (so the menu would sit above the avatar). Passing a different element as `anchor` re-anchors the floating menu to that element's rect. Wrap the icon in a `<span>` and `bind:this={chevronEl}` because lucide components don't expose their underlying SVG via `bind:this`.
- **`bind:open` + `style:transform`** rotates the chevron with the menu state — points down when closed, up when open.

Install the dependencies if missing:

```bash
bun x bosia@latest add sidebar dropdown-menu avatar
```

## Right-Side Sidebar

```svelte
<Sidebar side="right">...</Sidebar>
```

## SidebarTrigger

A pre-styled toggle button. Place it in your main content area and wire it to the sidebar's `collapsed` state:

```svelte
<script lang="ts">
	import { Sidebar, SidebarTrigger } from "$lib/components/ui/sidebar";

	let collapsed = $state(false);
</script>

<div class="flex h-screen">
	<Sidebar collapsible="icon" bind:collapsed>...</Sidebar>

	<main class="flex-1 p-6">
		<SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />
		<!-- Page content -->
	</main>
</div>
```

## Accessing Sidebar State

Use `getSidebarContext()` in any component inside the sidebar tree to read `collapsed` or call `toggle()`:

```svelte
<script lang="ts">
	import { getSidebarContext } from "$lib/components/ui/sidebar";

	const sidebar = getSidebarContext();
</script>

{#if !sidebar.collapsed}
	<span>Visible when expanded</span>
{/if}
```

## Controlled Collapse

```svelte
<script lang="ts">
	let collapsed = $state(false);
</script>

<Sidebar bind:collapsed>...</Sidebar>

<button onclick={() => (collapsed = !collapsed)}>Toggle</button>
```

## CSS Custom Properties

Style the sidebar using these CSS variables in your `app.css`:

```css
:root {
	--sidebar-width: 16rem;
	--sidebar-width-icon: 3rem;
	--color-sidebar: var(--color-background);
	--color-sidebar-foreground: var(--color-foreground);
	--color-sidebar-accent: var(--color-accent);
	--color-sidebar-accent-foreground: var(--color-accent-foreground);
}
```
