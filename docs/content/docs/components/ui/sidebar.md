---
title: Sidebar
description: A composable sidebar with header, content, groups, menus, and collapsible icon mode.
demo: SidebarDemo
---

```bash
bosia add sidebar
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
