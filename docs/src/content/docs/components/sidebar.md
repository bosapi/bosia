---
title: Sidebar
description: A composable sidebar with header, content, groups, menus, and collapsible icon mode.
---

```bash
bosia add sidebar
```

A composable sidebar with header, scrollable content, grouped menus, collapsible items, and icon-mode collapse. Uses `sidebar-*` CSS custom properties for theming.

## Basic Usage

```svelte
<script lang="ts">
  import {
    Sidebar, SidebarHeader, SidebarContent,
    SidebarGroup, SidebarMenu, SidebarMenuItem,
    SidebarFooter,
  } from "$lib/components/ui/sidebar";
</script>

<div class="flex h-screen">
  <Sidebar>
    <SidebarHeader>
      <span class="text-lg font-bold">⬡ Bosia</span>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup label="Navigation">
        <SidebarMenu>
          <SidebarMenuItem href="/" label="Home" icon="🏠" active />
          <SidebarMenuItem href="/dashboard" label="Dashboard" icon="📊" />
          <SidebarMenuItem href="/settings" label="Settings" icon="⚙️" />
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

| Component           | Description                                      |
| ------------------- | ------------------------------------------------ |
| `Sidebar`           | Root container with collapse support             |
| `SidebarHeader`     | Top section with border-bottom                   |
| `SidebarContent`    | Scrollable middle area                           |
| `SidebarFooter`     | Bottom section with border-top                   |
| `SidebarGroup`      | Groups items under an optional uppercase label   |
| `SidebarMenu`       | `<ul>` wrapper for menu items                    |
| `SidebarMenuItem`   | Link, button, or static text item with icon      |

## Sidebar Props

| Prop          | Type                         | Default   |
| ------------- | ---------------------------- | --------- |
| `side`        | `"left"` \| `"right"`       | `"left"`  |
| `collapsible` | `"icon"` \| `"none"`        | `"icon"`  |
| `collapsed`   | `boolean` (bindable)         | `false`   |

## Collapsible Menu Items

`SidebarMenuItem` supports nested children for collapsible sub-menus:

```svelte
<SidebarMenuItem label="Analytics" icon="📈">
  <SidebarMenuItem href="/analytics/overview" label="Overview" />
  <SidebarMenuItem href="/analytics/reports" label="Reports" />
</SidebarMenuItem>
```

## Right-Side Sidebar

```svelte
<Sidebar side="right">
  ...
</Sidebar>
```

## Controlled Collapse

```svelte
<script lang="ts">
  let collapsed = $state(false);
</script>

<Sidebar bind:collapsed>
  ...
</Sidebar>

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
