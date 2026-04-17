---
title: Components Overview
description: Copy-paste UI components from the Bosia registry — shadcn-style, fully yours to customize.
---

Bosia ships a component registry — a collection of Svelte 5 UI components you install directly into your project. Like [shadcn/ui](https://ui.shadcn.com), components are **copied into your codebase**, not imported from a package. You own the code and can customize it freely.

## Installing Components

```bash
bosia add <component>
```

This downloads the component files into `src/lib/components/ui/<component>/` and auto-creates `src/lib/utils.ts` (the `cn()` helper) if it doesn't exist.

### Path-based Names

Use a path to install components outside the default `ui/` directory:

```bash
bosia add button              # → src/lib/components/ui/button/
bosia add shop/cart           # → src/lib/components/shop/cart/
```

Components without a `/` default to the `ui/` prefix. Components with a path are installed to the exact path under `src/lib/components/`.

Dependencies between components are resolved automatically. For example, `bosia add data-table` also installs `button`, `input`, and `separator`.

### Local Development

Use `--local` to install from the local registry (useful when developing Bosia itself):

```bash
bosia add button --local
```

## Using Components

Import from the component's barrel export:

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<Button variant="outline" size="sm">Click me</Button>
```

## Available Components

| Component                                          | Description                                      |
| -------------------------------------------------- | ------------------------------------------------ |
### UI

| Component                                              | Description                                      |
| ------------------------------------------------------ | ------------------------------------------------ |
| [Avatar](/components/ui/avatar/)                       | Image avatar with fallback                       |
| [Badge](/components/ui/badge/)                         | Small status label                               |
| [Button](/components/ui/button/)                       | Accessible button with variants and sizes        |
| [Card](/components/ui/card/)                           | Composable card with header, content, footer     |
| [Chart](/components/ui/chart/)                         | SVG line and bar charts with tooltips            |
| [Data Table](/components/ui/data-table/)               | Table with sorting, filtering, pagination        |
| [Dropdown Menu](/components/ui/dropdown-menu/)         | Context-managed dropdown                         |
| [Icon](/components/ui/icon/)                           | Inline SVG icons (Lucide-style)                  |
| [Input](/components/ui/input/)                         | Styled text input with bindable value            |
| [Navbar](/components/ui/navbar/)                       | Responsive navbar with mobile menu and theme toggle |
| [Separator](/components/ui/separator/)                 | Horizontal or vertical divider                   |
| [Sidebar](/components/ui/sidebar/)                     | Composable sidebar with collapsible icon mode    |

### Todo

| Component                                              | Description                                      |
| ------------------------------------------------------ | ------------------------------------------------ |
| [Todo Form](/components/todo/todo-form/)               | Form for creating new todo items                 |
| [Todo Item](/components/todo/todo-item/)               | Single todo with toggle, edit, and delete        |
| [Todo List](/components/todo/todo-list/)               | List of todos with completion stats              |

## Customization

All components use `cn()` for class merging, so you can pass a `class` prop to override or extend styles:

```svelte
<Button class="w-full rounded-full">Full Width Rounded</Button>
```

Components use Tailwind CSS design tokens (`bg-primary`, `text-muted-foreground`, etc.) defined in your `app.css`. Customize the look by editing your theme tokens.

## The `cn()` Utility

Auto-created at `src/lib/utils.ts` on first `bosia add`. It merges Tailwind classes using built-in class merging + `tailwind-merge`:

```ts
import { cn } from "$lib/utils";

cn("px-4 py-2", condition && "bg-primary", className);
// → merges and deduplicates classes intelligently
```
