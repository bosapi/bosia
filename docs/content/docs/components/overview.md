---
title: Components Overview
description: Copy-paste UI components from the Bosia registry — shadcn-style, fully yours to customize.
---

Bosia ships a component registry — a collection of Svelte 5 UI components you install directly into your project. Like [shadcn/ui](https://ui.shadcn.com), components are **copied into your codebase**, not imported from a package. You own the code and can customize it freely.

## Installing Components

```bash
bun x bosia@latest add <component...>
```

This downloads the component files into `src/lib/components/ui/<component>/` and auto-creates `src/lib/utils.ts` (the `cn()` helper) if it doesn't exist.

Pass multiple names to install several components in one call:

```bash
bun x bosia@latest add button card input
```

### Path-based Names

Use a path to install components outside the default `ui/` directory:

```bash
bun x bosia@latest add button              # → src/lib/components/ui/button/
bun x bosia@latest add shop/cart           # → src/lib/components/shop/cart/
```

Components without a `/` default to the `ui/` prefix. Components with a path are installed to the exact path under `src/lib/components/`.

Dependencies between components are resolved automatically. For example, `bun x bosia@latest add data-table` also installs `button`, `input`, and `separator`.

### Non-interactive Mode

Pass `-y` (or `--yes`) to auto-confirm the "replace existing component?" prompt — useful for CI pipelines and shell scripts:

```bash
bun x bosia@latest add -y button card
```

### Local Development

Use `--local` to install from the local registry (useful when developing Bosia itself):

```bash
bun x bosia@latest add button --local
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

Sixty primitives, all installed the same way. Higher-level [blocks](/docs/blocks/overview/) and [pages](/docs/pages/overview/) compose these.

| Component                                          | Description                                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Accordion](/components/ui/accordion/)             | A vertically stacked set of interactive headings that each reveal a section of content. |
| [Alert](/components/ui/alert/)                     | Displays a callout for important messages with default and destructive variants.        |
| [Alert Dialog](/components/ui/alert-dialog/)       | A modal alert dialog that requires an explicit response.                                |
| [Aspect Ratio](/components/ui/aspect-ratio/)       | Displays content within a desired ratio.                                                |
| [Avatar](/components/ui/avatar/)                   | An avatar with image and fallback slots.                                                |
| [Badge](/components/ui/badge/)                     | A small status badge with multiple variants.                                            |
| [Breadcrumb](/components/ui/breadcrumb/)           | Displays the path to the current resource as a hierarchy of links.                      |
| [Button](/components/ui/button/)                   | An accessible button with multiple variants and sizes.                                  |
| [Button Group](/components/ui/button-group/)       | Visually groups multiple buttons into a single connected unit.                          |
| [Calendar](/components/ui/calendar/)               | A date selection calendar with keyboard support and min/max constraints.                |
| [Card](/components/ui/card/)                       | A card with header, content, and footer slots.                                          |
| [Carousel](/components/ui/carousel/)               | A carousel with slide navigation, keyboard support, and snap scrolling.                 |
| [Chart](/components/ui/chart/)                     | SVG line and bar charts with tooltips — zero dependencies.                              |
| [Checkbox](/components/ui/checkbox/)               | A checkbox control for toggling options on and off.                                     |
| [Collapsible](/components/ui/collapsible/)         | An interactive component that expands/collapses a panel.                                |
| [Combobox](/components/ui/combobox/)               | A searchable select built on Popover + Command.                                         |
| [Command](/components/ui/command/)                 | A filterable command palette with keyboard navigation and groups.                       |
| [Context Menu](/components/ui/context-menu/)       | A right-click menu with items, shortcuts, separators, and sub-menus.                    |
| [Data Table](/components/ui/data-table/)           | A data table with sorting, filtering, and pagination.                                   |
| [Date Picker](/components/ui/date-picker/)         | A date picker built on Popover + Calendar.                                              |
| [Dialog](/components/ui/dialog/)                   | A modal dialog with focus trap, scroll lock, and accessible markup.                     |
| [Direction](/components/ui/direction/)             | Sets text direction (LTR/RTL) via context.                                              |
| [Drawer](/components/ui/drawer/)                   | A mobile-first bottom-sheet overlay with focus trap and slide-up animation.             |
| [Dropdown Menu](/components/ui/dropdown-menu/)     | A context-managed dropdown with trigger, content, items, and separators.                |
| [Empty](/components/ui/empty/)                     | An empty state with icon, title, description, and action slots.                         |
| [Field](/components/ui/field/)                     | A form field wrapper that auto-wires accessibility attributes.                          |
| [Form](/components/ui/form/)                       | A form wrapper that manages validation state and feeds errors into Fields.              |
| [Hover Card](/components/ui/hover-card/)           | A hover-triggered floating panel for rich previews.                                     |
| [Icons](/components/ui/icon/)                      | Guide for using `@lucide/svelte` — tree-shakeable Lucide icons.                         |
| [Input](/components/ui/input/)                     | A styled text input.                                                                    |
| [Input Group](/components/ui/input-group/)         | Combine inputs with addons, buttons, and text.                                          |
| [Input OTP](/components/ui/input-otp/)             | Accessible one-time password input with copy-paste support.                             |
| [Item](/components/ui/item/)                       | A flex container with media, title, description, and actions.                           |
| [Kbd](/components/ui/kbd/)                         | Displays keyboard shortcut keys; optionally binds real shortcuts.                       |
| [Label](/components/ui/label/)                     | An accessible label for form controls.                                                  |
| [Menubar](/components/ui/menubar/)                 | A horizontal menu bar with multiple dropdown menus.                                     |
| [Native Select](/components/ui/native-select/)     | A styled native HTML select.                                                            |
| [Navbar](/components/ui/navbar/)                   | A responsive navbar with mobile menu, theme toggle, and user avatar.                    |
| [Navigation Menu](/components/ui/navigation-menu/) | Top-level navigation with hover/focus popover panels.                                   |
| [Pagination](/components/ui/pagination/)           | Pagination with page navigation and next/previous links.                                |
| [Popover](/components/ui/popover/)                 | A floating panel with configurable trigger, side, and alignment.                        |
| [Progress](/components/ui/progress/)               | Shows the completion progress of a task.                                                |
| [Radio Group](/components/ui/radio-group/)         | A set of radio buttons for single-selection input.                                      |
| [Range Calendar](/components/ui/range-calendar/)   | A date-range calendar with hover preview and keyboard navigation.                       |
| [Resizable](/components/ui/resizable/)             | Accessible resizable panel groups with drag support.                                    |
| [Scroll Area](/components/ui/scroll-area/)         | A scrollable container with a custom styled scrollbar.                                  |
| [Select](/components/ui/select/)                   | A dropdown select for single-value selection.                                           |
| [Separator](/components/ui/separator/)             | A horizontal or vertical divider line.                                                  |
| [Sidebar](/components/ui/sidebar/)                 | A composable sidebar with groups, menus, and collapsible icon mode.                     |
| [Skeleton](/components/ui/skeleton/)               | A placeholder for loading states.                                                       |
| [Slider](/components/ui/slider/)                   | A slider input supporting single and range modes.                                       |
| [Sonner](/components/ui/sonner/)                   | An opinionated toast notification component with zero dependencies.                     |
| [Spinner](/components/ui/spinner/)                 | An animated loading indicator.                                                          |
| [Switch](/components/ui/switch/)                   | A toggle switch for on/off states.                                                      |
| [Table](/components/ui/table/)                     | Styled table sub-components for building data displays.                                 |
| [Tabs](/components/ui/tabs/)                       | Layered sections of content displayed one at a time.                                    |
| [Textarea](/components/ui/textarea/)               | A styled multi-line text input.                                                         |
| [Toggle](/components/ui/toggle/)                   | A two-state button that can be toggled on or off.                                       |
| [Toggle Group](/components/ui/toggle-group/)       | A group of toggle buttons where one or more can be active.                              |
| [Tooltip](/components/ui/tooltip/)                 | A popup shown on hover or focus.                                                        |
| [Typography](/components/ui/typography/)           | Semantic typography components with pre-styled Tailwind classes.                        |

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
