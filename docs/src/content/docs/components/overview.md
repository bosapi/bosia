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
| [Button](/components/button/)                      | Accessible button with variants and sizes        |
| [Badge](/components/badge/)                        | Small status label                               |
| [Card](/components/card/)                          | Composable card with header, content, footer     |
| [Input](/components/input/)                        | Styled text input with bindable value            |
| [Avatar](/components/avatar/)                      | Image avatar with fallback                       |
| [Separator](/components/separator/)                | Horizontal or vertical divider                   |
| [Icon](/components/icon/)                          | Inline SVG icons (Lucide-style)                  |
| [Dropdown Menu](/components/dropdown-menu/)        | Context-managed dropdown                         |
| [Data Table](/components/data-table/)              | Table with sorting, filtering, pagination        |

## Customization

All components use `cn()` for class merging, so you can pass a `class` prop to override or extend styles:

```svelte
<Button class="w-full rounded-full">Full Width Rounded</Button>
```

Components use Tailwind CSS design tokens (`bg-primary`, `text-muted-foreground`, etc.) defined in your `app.css`. Customize the look by editing your theme tokens.

## The `cn()` Utility

Auto-created at `src/lib/utils.ts` on first `bosia add`. It merges Tailwind classes using `clsx` + `tailwind-merge`:

```ts
import { cn } from "$lib/utils";

cn("px-4 py-2", condition && "bg-primary", className);
// → merges and deduplicates classes intelligently
```
