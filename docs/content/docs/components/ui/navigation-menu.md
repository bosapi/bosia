---
title: Navigation Menu
description: Horizontal top-level navigation with hover/focus-triggered popover panels.
demo: NavigationMenuDemo
---

```bash
bosia add navigation-menu
```

A compound horizontal navigation menu where each item can reveal a popover of related links. Only one panel is open at a time and a small hover-intent delay prevents flicker as the cursor moves between triggers and panels.

## Preview

## Props

### NavigationMenu

| Prop         | Type               | Default |
| ------------ | ------------------ | ------- |
| `value`      | `string \| null`   | `null`  |
| `openDelay`  | `number`           | `150`   |
| `closeDelay` | `number`           | `200`   |
| `class`      | `string`           | `""`    |

## Sub-components

- `NavigationMenu` — root `<nav aria-label="Main">`, context provider that tracks the single open item and handles click-outside + Escape dismissal
- `NavigationMenuList` — `<ul>` flex container
- `NavigationMenuItem` — `<li>` that generates a stable id and hosts the hover bridge
- `NavigationMenuTrigger` — `<button>` with `aria-expanded`, `aria-controls`, rotating chevron, and `ArrowDown` to focus the first link inside the panel
- `NavigationMenuContent` — absolute-positioned popover; closes on Escape and returns focus to its trigger
- `NavigationMenuLink` — block anchor with `focus-visible` ring

## Usage

```svelte
<script lang="ts">
  import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
  } from "$lib/components/ui/navigation-menu";
</script>

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul class="grid w-[420px] gap-3">
          <li>
            <NavigationMenuLink href="/getting-started">
              Introduction
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/project-structure">
              Project Structure
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>

    <NavigationMenuItem>
      <NavigationMenuLink
        href="/docs"
        class="inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Docs
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Hover Delays

`openDelay` controls how long a pointer must rest on a trigger before the first panel opens. `closeDelay` gives users a grace period to move the cursor from the trigger into the panel (the "hover bridge").

Switching between already-open items is always instant — users expect snappy horizontal navigation once the menu has revealed itself.

```svelte
<NavigationMenu openDelay={200} closeDelay={150}>
  <!-- ... -->
</NavigationMenu>
```

## Controlled

Bind `value` to track or set the currently open item id.

```svelte
<script lang="ts">
  let value = $state<string | null>(null);
</script>

<NavigationMenu bind:value>
  <!-- ... -->
</NavigationMenu>

<p>Open item: {value ?? "none"}</p>
```

## Keyboard

| Key          | Action                                                           |
| ------------ | ---------------------------------------------------------------- |
| `Tab`        | Move focus to the next trigger or link                           |
| `ArrowDown`  | On a trigger, opens the panel and focuses the first link inside  |
| `Escape`     | Closes the open panel and returns focus to its trigger           |
