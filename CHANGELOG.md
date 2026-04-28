# Changelog

All notable changes to Bosia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.2.2] - 2026-04-28

### Security
- Scope `load()` / `metadata()` `fetch` cookie forwarding to same-origin requests — previously the user's `Cookie` header was attached to every outbound URL including third-party hosts, leaking the session token. Cookies are now sent only to same-origin or `INTERNAL_HOSTS`-allowlisted origins. **Behavior change:** `load()` calls to external APIs no longer auto-forward cookies; pass `Authorization` or `init.headers.cookie` explicitly. Set `INTERNAL_HOSTS=https://api.example.com,http://users-svc:8080` to allowlist cross-origin internal services that share the session

### Changed
- Bound prefetch cache to 50 entries with LRU eviction — oldest entry evicted when cache is full, preventing unbounded memory growth on pages with many prefetchable links
- Prefetch cache TTL — entries older than 30s are discarded on consumption and re-fetched on hover/viewport, preventing stale data after long idle

### Fixed
- Router click handler now respects modifier keys (Cmd/Ctrl/Shift/Alt), non-primary mouse buttons (middle-click), `e.defaultPrevented`, and `rel="external"` — previously hijacked all same-origin anchor clicks, breaking "open in new tab/window"

---

## [0.2.1] - 2026-04-26

### Changed
- Pre-compile route patterns to `RegExp` at startup — `findMatch()` uses `regex.exec()` instead of splitting strings on every request; falls back to legacy matching for uncompiled routes (backward compat)

---

## [0.2.0] - 2026-04-25

### Added
- Request deduplication for `/__bosia/data/` endpoint — concurrent identical GET requests share a single in-flight loader promise instead of running the loader multiple times; auto-cleans on settle, no TTL needed

### Changed
- Parallelize client and server `Bun.build()` calls for ~500-1000ms faster builds
- Parallelize Tailwind CSS build with client+server bundles for ~500-800ms faster builds
- Convert `sequence()` middleware from recursion to iterative loop to prevent stack overflow with many handlers

---

## [0.1.26] - 2026-04-24

### Added

- `direction` UI component — RTL/LTR context provider; wraps content with `dir` attribute and exposes `useDirection()` for descendant components to read text direction; zero dependencies
- `kbd` UI component — keyboard shortcut display with keycap styling; `KbdGroup` renders key combinations with "+" separators; zero dependencies
- `scroll-area` component — scrollable container with custom styled scrollbar, supports `vertical`, `horizontal`, and `both` orientations
- `resizable` component — drag-to-resize panel groups with pointer-based resize, horizontal/vertical layouts, nested group support, and optional grip handle; zero external dependencies
- `menubar` UI component — horizontal menu bar with multiple dropdown menus; click-to-open, hover-switch between open menus, Escape/click-outside to close; compound component with `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator`, `MenubarLabel`, `MenubarShortcut`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`; nested sub-menus with hover open/close and fly-out animation; zero dependencies
- `context-menu` UI component — right-click triggered context menu with fixed positioning at cursor; compound component with `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuLabel`, `ContextMenuShortcut`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`; disabled items, keyboard shortcut hints, nested sub-menus with hover delay; zero dependencies

### Changed

- `kbd` — `Kbd` and `KbdGroup` now support `onPress` callback to bind actual keyboard shortcuts; keys are inferred from rendered content, modifier keys detected automatically; `preventDefault` prop controls default behavior suppression

---

## [0.1.25] - 2026-04-23

### Added

- `aspect-ratio` UI component — displays content within a desired ratio using CSS padding-bottom technique; configurable `ratio` prop (default `16/9`); supports `cn()` class merging and `...restProps`; zero dependencies
- `range-calendar` UI component — date range selection with start/end click flow, hover preview styling, and keyboard navigation; reuses `CalendarHeader` via dual context architecture; depends on `calendar` component

### Fixed

- Component preview renders at `## Preview` heading instead of above all markdown content — split HTML at preview marker so demo appears inline where the heading is
- Restore previews for components without `## Preview` heading (sidebar, navbar, chart, data-table, icon) — added missing `## Preview` heading to all 5 markdown files; also added top-of-page fallback rendering for any future components missing the heading
- Component preview no longer clips floating content (popover, dropdown, select, combobox, date picker, hover card, navigation menu) — removed `overflow: hidden` from `.preview-wrapper`, applied border-radius to tab-bar and content containers individually; removed hardcoded heights from 7 demo files

---

## [0.1.24] - 2026-04-22

### Added

- `trigger` prop on `Popover` component — `"click"` (default) or `"hover"` mode; hover keeps popover open while cursor is over trigger or content; touch devices degrade to tap-to-toggle
- `closeDelay` prop on `Popover` — configurable delay (ms) before closing in hover mode (default `150`)
- `show()` and `hide()` methods exposed in Popover context for programmatic open/close with timer
- `trigger` prop on `SidebarMenuItem` — `"click"` (default) or `"hover"` for collapsed popover sub-menus; hover opens on mouse enter, closes on leave with 150ms delay; touch devices degrade to tap-to-toggle

---

## [0.1.23] - 2026-04-21

### Added

- `typography` UI component — 12 semantic typography wrappers with pre-styled Tailwind classes; `TypographyH1` (`<h1>`, extrabold 4xl), `TypographyH2` (`<h2>`, semibold 3xl with border-b), `TypographyH3` (`<h3>`, semibold 2xl), `TypographyH4` (`<h4>`, semibold xl), `TypographyP` (`<p>`, leading-7 with sibling spacing), `TypographyBlockquote` (`<blockquote>`, italic with left border), `TypographyList` (`<ul>`, disc list with item spacing), `TypographyInlineCode` (`<code>`, mono on muted bg), `TypographyLead` (`<p>`, xl muted-foreground), `TypographyLarge` (`<div>`, lg semibold), `TypographySmall` (`<small>`, sm medium), `TypographyMuted` (`<p>`, sm muted-foreground); all support `cn()` class merging and `...restProps`; zero dependencies
- 6 new Lucide icons — `terminal`, `book`, `package`, `hash`, `map`, `circle`
- `SidebarTrigger` component — standalone toggle button for sidebar collapse; place anywhere in the main content area; uses `panel-left` icon
- `getSidebarContext()` export — access `collapsed` state and `toggle()` from any component inside the sidebar tree
- Collapsed sidebar popover sub-menus — clicking a parent menu item when collapsed opens a fixed-position popover showing the label as a header and all children as links; uses `SidebarPopover` context wrapper so children render in expanded mode; click-outside and Escape dismiss

### Changed

- Sidebar demo upgraded to shadcn-style — company header with logo/subtitle, Platform section with expandable sub-menus (Playground, Models, Documentation, Settings), Projects section with colored icons, user avatar footer with name/email

### Fixed

- Sidebar collapse now properly hides text — menu labels, group labels, header text, footer text, and chevrons all hidden when collapsed to icon-only mode; uses Svelte context (`setSidebarContext`/`getSidebarContext`) to share collapsed state with all child components
- Sidebar toggle button no longer blocks icons — removed built-in toggle from inside `<aside>`; replaced with `SidebarTrigger` placed in main content area
- Sidebar `overflow-hidden` on root `<aside>` — clips overflowing text during width transition
- Menu items center icons when collapsed — removed gap/padding, added `justify-center`
- Sub-menus hidden when sidebar collapsed — prevents orphaned child lists in icon-only mode

## [0.1.22] - 2026-04-20

### Added

- `empty` UI component — empty state compound component for placeholder UI when no data; `Empty` (dashed border container, centered layout), `EmptyHeader` (groups media + text), `EmptyMedia` with `variant` (`"default"` | `"icon"`), `EmptyTitle` (`<h3>`), `EmptyDescription` (with link styling), `EmptyContent` (action area); all sub-components support `cn()` class merging, `data-slot` attributes, and `...restProps`; zero dependencies
- `carousel` UI component — pure CSS scroll-snap carousel with keyboard navigation; `Carousel` (root with context, `orientation` prop `"horizontal"` | `"vertical"`, arrow-key handling), `CarouselContent` (scrollable flex viewport with hidden scrollbar), `CarouselItem` (`snap-start` slide wrapper, `role="group"`, `aria-roledescription="slide"`, configurable `basis` for multi-item views), `CarouselPrevious`/`CarouselNext` (outline icon buttons with chevron SVGs, auto-disable at scroll bounds, absolute positioned); zero external dependencies; depends on `ui/button`; `autoplay` prop (`boolean | number`, default `false`) — `true` = 4000ms interval, number = custom ms, pauses on hover/focus, loops back to start at end

## [0.1.21] - 2026-04-19

### Added

- `form` UI component — form wrapper with validation state management; `Form` (`<form>` with `preventDefault`, `validate` function that receives `FormData` and returns `Record<string, string>` of field errors, async `onsubmit` handler with `submitting` state tracking, `onreset` clears all errors); provides `"form"` context with `fieldError(name)`, `setFieldError(name, msg)`, `clearFieldError(name)`, and `submitting` getter; pairs with `Field` via `name` prop — `Field` now accepts optional `name` and resolves errors from form context via `$derived.by` (direct `error` prop takes precedence); native `FormData` collection at submit time (no duplicated reactive state); user-provided `validate` function works with any schema library (Zod, Valibot, hand-rolled); `Field` remains fully backward-compatible without `Form` wrapper; depends on `ui/field`

## [0.1.20] - 2026-04-18

### Added

- `item` UI component — versatile flex container compound component for displaying content with media, title, description, and actions; `Item` root with `variant` (`"default"` | `"outline"` | `"muted"`) and `size` (`"default"` | `"sm"`) props, `child` snippet for polymorphic rendering; `ItemMedia` with `variant` (`"default"` | `"icon"` | `"image"`); `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemHeader`, `ItemFooter` layout sub-components; `ItemGroup` (`role="list"` wrapper) and `ItemSeparator` (divider); all sub-components support `cn()` class merging and `...restProps`; zero dependencies
- `collapsible` UI component — expand/collapse primitive with `Collapsible` (root, `$bindable()` `open`, `disabled`, `data-state="open"|"closed"`, context provider with `open`/`disabled` getters and `toggle()` method, unique `baseId` for ARIA wiring), `CollapsibleTrigger` (`<button>` with `aria-expanded`, `aria-controls`, `data-state`, `data-disabled`, calls `toggle()` on click, `disabled:pointer-events-none disabled:opacity-50`), and `CollapsibleContent` (conditionally rendered via `{#if open}`, `role="region"`, `aria-labelledby` pointing to trigger); simpler than Accordion — single open/closed state, no multi-item coordination or arrow-key navigation; zero dependencies
- `date-picker` UI component — convenience wrapper that composes `Popover` + `Calendar` into a single date picker; `DatePicker` with `$bindable()` `value` (`Date | undefined`), configurable `placeholder`, `min`/`max` date constraints, custom `disabled` function, `weekStartsOn` 0–6, `fixedWeeks` boolean, `buttonDisabled`, custom `formatDate` function (default `toLocaleDateString`), `trigger` snippet for custom trigger content, `contentClass` for popover styling; auto-closes popover on date selection via `$effect` + `untrack()` pattern; inlined calendar icon SVG; depends on `ui/popover` and `ui/calendar`

## [0.1.19] - 2026-04-17

### Added

- `table` UI component — styled wrapper sub-components around native HTML table elements; `Table` (`<table>` in a scrollable `<div>`, `w-full caption-bottom text-sm`), `TableHeader` (`<thead>`, `[&_tr]:border-b`), `TableBody` (`<tbody>`, `[&_tr:last-child]:border-0`), `TableFooter` (`<tfoot>`, `bg-muted/50 border-t font-medium`), `TableRow` (`<tr>`, `border-b hover:bg-muted/50 data-[state=selected]:bg-muted`), `TableHead` (`<th>`, `h-10 px-2 font-medium text-muted-foreground`), `TableCell` (`<td>`, `p-2 align-middle`), and `TableCaption` (`<caption>`, `text-muted-foreground mt-4 text-sm`); each sub-component supports `cn()` class merging, `children` snippet, and `...restProps` spread; zero dependencies
- `calendar` UI component — date selection calendar with native JS `Date` math; `Calendar` (root, `setContext` provider, `$bindable()` `value` and `month`, configurable `min`/`max` date constraints, custom `disabled` function, `weekStartsOn` 0–6, `fixedWeeks` boolean for 6-row grid, `p-3`), `CalendarHeader` (prev/next `<button>` with chevron SVGs, `<select>` dropdowns for month Jan–Dec and year with min/max-clamped range, `h-7` compact controls, `hover:bg-accent`, `focus-visible:ring-2 ring-ring`), `CalendarGrid` (`<table role="grid" aria-label="Calendar">` with `<thead>` day-of-week abbreviations respecting `weekStartsOn`, `$derived.by()` week-row computation, full keyboard navigation ArrowLeft/Right/Up/Down, Home/End, PageUp/PageDown, Enter/Space, `requestAnimationFrame` focus management via `data-date` attribute), and `CalendarDay` (`<button>` per day cell, `h-8 w-8 rounded-md`, `bg-primary text-primary-foreground` when selected, `bg-accent text-accent-foreground` for today, `text-muted-foreground opacity-50` for outside-month and disabled, `data-selected`/`data-today`/`data-outside-month`/`data-disabled` attributes, `aria-label` with full date string); zero dependencies

### Changed

- `data-table` now uses `Table`, `TableBody`, `TableRow`, `TableCell`, `TableHeader`, `TableHead` primitives from `ui/table` instead of raw HTML elements; logic, API, and behavior unchanged

### Removed

- `clsx` external dependency — class merging logic inlined into `cn()` utility; removed from `packages/bosia`, `apps/demo`, `docs`, and all project templates

## [0.1.18] - 2026-04-16

### Added

- `native-select` UI component — styled wrapper around native HTML `<select>` with `appearance-none` and custom chevron SVG via CSS `background-image`; `NativeSelect` (`<select>` with `$bindable()` `value`, Input-matching border/focus/disabled styles, `h-8` height), `NativeSelectOption` (thin `<option>` wrapper with `value` and `disabled`), and `NativeSelectOptGroup` (`<optgroup>` wrapper with `label` and `disabled`); mobile-friendly, form-compatible, zero dependencies
- `input-otp` UI component — accessible one-time password input with copy-paste and SMS autofill support; `InputOTP` (root, `$bindable()` `value`, configurable `maxlength` default `6`, optional `pattern` RegExp to restrict characters with automatic revert on mismatch, `disabled`, `name`, `id`, `autocomplete="one-time-code"` and `inputmode="numeric"` defaults, optional `onComplete(value)` callback fired when `value.length === maxlength`, renders a hidden `<input>` absolutely positioned over the slot row with `opacity: 0` and `pointer-events-auto` so it owns focus/caret/selection/paste/IME, exposes context getters `value`/`maxlength`/`isFocused`/`selectionStart`/`selectionEnd`/`disabled` plus a `focus()` method), `InputOTPGroup` (`role="group"` flex container for visually grouping slots), `InputOTPSlot` (single character cell bound to an `index`, `h-9 w-9` cell with `border-input`, `first:rounded-l-md first:border-l`, `last:rounded-r-md`, `ring-2 ring-ring ring-offset-background` when active, pure `$derived.by()` computation of `isActive` based on selection start/end so no `$effect`/register loop, renders the character and a 1px `animate-pulse` caret span when active and empty), and `InputOTPSeparator` (`role="separator"` with an inline minus SVG default and children override); zero dependencies

## [0.1.17] - 2026-04-14

### Added

- `button-group` UI component — CSS-only container that merges adjacent `Button` elements into a single connected unit; `ButtonGroup` (`role="group"`, `data-slot="button-group"`, `data-orientation`) with `orientation="horizontal"` (default) and `orientation="vertical"` support; horizontal mode collapses borders via `-ml-px` and restores outer radius (`[&>*:first-child]:rounded-l-md`, `[&>*:last-child]:rounded-r-md`); vertical mode collapses borders via `-mt-px` and restores outer radius (`[&>*:first-child]:rounded-t-md`, `[&>*:last-child]:rounded-b-md`); all children get `rounded-none` via `[&>*]` selector; hovered/focused children are lifted with `z-10` so their borders render above siblings; no Svelte context, no sub-components — consumers compose existing `Button` components inside; zero dependencies

## [0.1.16] - 2026-04-12

### Added

- `input-group` UI component — composite input container with `InputGroup` (root, `role="group"`, flex-wrap container with `border-input`, `focus-within:border-primary`, `has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive`), `InputGroupInput` (borderless `h-8` input, `flex-1 min-w-0 bg-transparent`, `data-slot="input-group-control"`), `InputGroupTextarea` (borderless `min-h-16` textarea with `field-sizing-content` auto-grow, `data-slot="input-group-control"`), `InputGroupAddon` (prefix/suffix wrapper with `align` prop `inline-start`/`inline-end`/`block-start`/`block-end` using `order-first`/`order-last` and `w-full` for block variants, `data-slot="input-group-addon"` + `data-align`), `InputGroupButton` (compact button with four sizes `xs`/`sm`/`icon-xs`/`icon-sm`, `hover:bg-accent`, `focus-visible` ring), and `InputGroupText` (muted `<span>` for currency/units/domains); zero dependencies
- `combobox` UI component — convenience wrapper that composes `Popover` + `Command` into a single searchable select; single-file `Combobox` with `items: { value, label, keywords?, disabled? }[]` API, `$bindable()` `value`, configurable `placeholder`/`searchPlaceholder`/`emptyText`, `disabled`, `class` (trigger) and `contentClass` (popover content) passthrough; internal `open = $state(false)` wired to `Popover`, `selectedLabel` as pure `$derived` over `items`/`value`, module-scoped stable `handleSelect` passed to every `CommandItem` to avoid child-registration effect churn, trigger rendered as `PopoverTrigger` with `role="combobox"` + `aria-haspopup="listbox"` + inlined outline button classes + chevrons-up-down SVG, `PopoverContent` with `align="start"` and `p-0` default, inner `Command` → `CommandInput` → `CommandList` → `CommandEmpty` → `CommandGroup` loop with per-item check SVG toggled via `opacity-100`/`opacity-0`; selecting the current value toggles it back to `undefined` (shadcn-style deselect); depends on `ui/popover` and `ui/command`
- `command` UI component — filterable command palette primitive with `Command` (root, context provider, `$bindable()` `value`, pluggable `filter` function with default substring match on value + optional per-item `keywords`, internal `items[]` registration via Svelte context, `userHighlight` + `$derived.by()` `highlightedValue` pattern that auto-falls back to first visible item when the user-highlighted item is filtered out, `ArrowUp`/`ArrowDown`/`Home`/`End` keyboard navigation with wrap-around, `Enter` selects highlighted item), `CommandInput` (`role="combobox"`, `aria-autocomplete="list"`, inlined search-icon SVG, bound to context `query`), `CommandList` (`role="listbox"`, `max-h-[300px] overflow-y-auto`), `CommandEmpty` (renders only when `visibleCount === 0`, configurable children with `"No results found."` default), `CommandGroup` (`role="group"`, optional `heading`, auto-hides via CSS `:has([role="option"]:not([hidden]))` when all its items are filtered out), `CommandItem` (`role="option"`, `aria-selected`, `aria-disabled`, `data-state="selected"`, registers/unregisters with `untrack()` so prop identity changes don't retrigger effect, `hidden` attribute when filtered out, `onmouseenter` sets highlight, `onclick` selects, `keywords` array for extended search matching, `disabled` state, custom `onSelect` callback), `CommandSeparator` (`role="separator"`), and `CommandShortcut` (`ml-auto` muted text); zero dependencies

## [0.1.15] - 2026-04-11

### Added

- `accordion` UI component — compound vertically stacked disclosure with `Accordion` (root, context provider, `type="single" | "multiple"`, `$bindable()` `value` as `string` or `string[]`, `collapsible` for single mode, group-level `disabled`, unique `baseId` for ARIA wiring), `AccordionItem` (child context provider that exposes `isOpen`/`dataState`/`triggerId`/`contentId`, `data-state="open"|"closed"`, `data-disabled`, `border-b last:border-b-0`), `AccordionTrigger` (semantic heading wrapper via `<svelte:element this={"h" + level}>` with configurable `level` prop defaulting to `3`, `<button aria-expanded aria-controls data-state>`, hover underline, `focus-visible` ring, inlined chevron-down SVG that rotates 180° via `[&[data-state=open]>svg]:rotate-180`, `ArrowUp`/`ArrowDown`/`Home`/`End` keyboard navigation that skips disabled triggers and wraps), and `AccordionContent` (`role="region"`, `aria-labelledby`, `hidden` attribute when closed so children state persists, `pb-4 pt-0` inner padding); zero dependencies
- `pagination` UI component — stateless, composable pagination with `Pagination` (`<nav role="navigation" aria-label="pagination">` with `mx-auto flex w-full justify-center`), `PaginationContent` (`<ul>` with `flex flex-row items-center gap-1`), `PaginationItem` (`<li>` passthrough), `PaginationLink` (`<a>` styled as a button with `isActive` → `aria-current="page"` + outline variant, otherwise ghost variant, `disabled` → `aria-disabled="true"` + `tabindex="-1"` + `pointer-events-none opacity-50`, and four sizes `default`/`sm`/`lg`/`icon`), `PaginationPrevious` (wraps `PaginationLink` with inline chevron-left SVG + "Previous" label, `aria-label="Go to previous page"`, forwards `disabled`, `gap-1 pl-2.5`), `PaginationNext` (wraps `PaginationLink` with "Next" label + inline chevron-right SVG, `aria-label="Go to next page"`, forwards `disabled`, `gap-1 pr-2.5`), and `PaginationEllipsis` (`<span aria-hidden="true">` with inline horizontal-ellipsis SVG and `sr-only` "More pages" text); parent owns page state, zero dependencies, self-contained inline button-variant classes (no `button` dep)
- `breadcrumb` UI component — semantic, stateless navigation component with `Breadcrumb` (`<nav aria-label="breadcrumb">`), `BreadcrumbList` (`<ol>` with `flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5`), `BreadcrumbItem` (`<li>` with `inline-flex items-center gap-1.5`), `BreadcrumbLink` (`<a>` with `href` prop and `hover:text-foreground transition-colors`), `BreadcrumbPage` (`<span>` with `role="link"`, `aria-disabled="true"`, `aria-current="page"` and `text-foreground font-normal` styling), `BreadcrumbSeparator` (`<li role="presentation" aria-hidden="true">` with inline chevron-right SVG default, overridable via children snippet), and `BreadcrumbEllipsis` (`<span aria-hidden="true">` with inline horizontal ellipsis SVG and `sr-only` "More" text); zero dependencies, zero state
- `navigation-menu` UI component — compound horizontal navigation with hover/focus-triggered popover panels; `NavigationMenu` (root `<nav aria-label="Main">`, context provider with `$bindable()` `value` tracking the single currently-open item id, configurable `openDelay` and `closeDelay` hover-intent timers, click-outside and Escape-to-dismiss), `NavigationMenuList` (`<ul>` flex container), `NavigationMenuItem` (`<li>` that generates a stable id, nests `setContext("navigation-menu-item")`, and hosts the hover bridge via `onmouseenter={cancelClose}` + `onmouseleave={scheduleClose(id)}`), `NavigationMenuTrigger` (`<button type="button">` with `aria-expanded`, `aria-controls`, `data-state="open"|"closed"`, inlined chevron-down SVG that rotates 180° when open, ArrowDown opens and focuses first link, immediate switch when moving between already-open items), `NavigationMenuContent` (absolute-positioned popover with `bg-popover text-popover-foreground`, fade/scale-in animation, `aria-labelledby` to trigger, Escape returns focus to trigger), and `NavigationMenuLink` (block anchor with `focus-visible` ring); zero dependencies

## [0.1.14] - 2026-04-10

### Added

- `tabs` UI component — compound tabs with `Tabs` (root, context provider, `$bindable()` `value`, unique `baseId` for ARIA wiring), `TabsList` (`role="tablist"`, `aria-orientation="horizontal"`, `bg-muted` pill), `TabsTrigger` (`role="tab"`, `aria-selected`, `aria-controls`, `data-state="active"|"inactive"`, roving tabindex, `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown`/`Home`/`End` keyboard navigation that focuses and activates the target tab, disabled state), and `TabsContent` (`role="tabpanel"`, `aria-labelledby`, `hidden` attribute when inactive so children state persists); zero dependencies
- `hover-card` UI component — compound hover-triggered floating panel with `HoverCard` (root, context provider, `$bindable()` `open`, configurable `openDelay` and `closeDelay` timers, Escape-to-dismiss), `HoverCardTrigger` (renders as `<a>` with `href`, hover/focus handlers, `aria-expanded`, `aria-controls`), and `HoverCardContent` (`role="dialog"`, four sides `top`/`right`/`bottom`/`left`, three alignments `start`/`center`/`end`, `sideOffset`, `w-64` default width, `bg-popover text-popover-foreground` styling, fade/scale-in animation, hover handlers on content so moving the cursor from trigger into card keeps it open)
- `popover` UI component — compound click-triggered floating panel with `Popover` (root, context provider, `$bindable()` `open`, click-outside and Escape-to-dismiss, unique `id` for `aria-controls`), `PopoverTrigger` (button with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`), and `PopoverContent` (`role="dialog"`, four sides `top`/`right`/`bottom`/`left`, three alignments `start`/`center`/`end`, `sideOffset`, `w-72` default width, `bg-popover text-popover-foreground` styling, fade/scale-in animation)
- `progress` UI component — linear progress indicator with `role="progressbar"` and full ARIA attributes (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`); `value` (nullable for indeterminate state) and `max` props; CSS `translateX` transform on inner indicator for left-to-right fill animation with `transition-all`; `bg-primary/20` track and `bg-primary` indicator; single-file component, zero dependencies
- `alert` UI component — compound alert with `Alert` (`role="alert"`, `default` and `destructive` variants), `AlertTitle` (`<h5>`), and `AlertDescription` (`<div>`); supports icon positioning via SVG child selectors, `cn()` class merging
- `alert-dialog` UI component — modal alert dialog with `role="alertdialog"` that requires explicit user response; includes `AlertDialog`, `AlertDialogContent` (focus trap, no backdrop close), `AlertDialogTrigger`, `AlertDialogAction` (primary button), `AlertDialogCancel` (outline button), `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, and `AlertDialogFooter`
- `sonner` UI component — zero-dependency toast notifications; `Toaster` component with configurable `position`, shadcn-compatible theming, dismiss button, and auto-dismiss after 4s; `toast()` function with `.success()`, `.error()`, `.info()`, `.warning()` variants and optional `description`; `toast.dismiss(id)` for programmatic dismissal; uses `SvelteMap` for reactive state
- `tooltip` UI component — compound tooltip with `Tooltip` (root, context provider, configurable `delayDuration`, Escape-to-dismiss), `TooltipTrigger` (button with hover/focus/blur handlers, `aria-describedby` when open), and `TooltipContent` (`role="tooltip"`, four sides `top`/`right`/`bottom`/`left`, three alignments `start`/`center`/`end`, `sideOffset`, fade-in animation); supports `$bindable()` `open` and keyboard accessibility via focus events
- `spinner` UI component — animated loading indicator with inlined Loader2 SVG path, `role="status"` and `aria-label="Loading"` defaults, `size-4 animate-spin` base classes customizable via Tailwind `size-*` and `text-*` utilities, additional attributes forwarded to the root `<svg>`, zero dependencies
- `skeleton` UI component — loading-state placeholder with `animate-pulse rounded-md bg-accent` base classes, fully customizable via Tailwind utility classes through the `class` prop, single `<div>` element, zero dependencies

## [0.1.13] - 2026-04-09

### Added

- `toggle` UI component — two-state button with `aria-pressed` and `data-state="on"|"off"`, `default` and `outline` variants, three sizes (`sm`, `default`, `lg`), disabled state, and `cn()` class merging; distinct from Switch (form control) — used for toolbar actions like bold/italic
- `textarea` UI component — multi-line text input with bindable `value`, `field-sizing-content` for auto-growing height, `min-h-16` minimum, placeholder and disabled states, and `cn()` class merging
- `switch` UI component — toggle switch with `role="switch"` and `aria-checked`, pill-shaped track with sliding thumb, hidden `<input type="checkbox">` for form submission, focus-visible ring, disabled state, and `data-state` attribute
- `field` UI component — form field accessibility wrapper with `Field` (root, generates unique `id`, sets context), `FieldLabel` (auto-wired `for`), `FieldControl` (passes `id`, `aria-describedby`, `aria-invalid` via `child` snippet prop), `FieldDescription` (helper text), and `FieldError` (`role="alert"`, falls back to context `error`)
- `toggle-group` UI component — compound toggle group with `ToggleGroup` (root, `role="group"`, `setContext`) and `ToggleGroupItem` (button with `aria-pressed`, `data-state`); supports `type="single"` (one active) and `type="multiple"` (many active), `default` and `outline` variants, three sizes (`sm`, `default`, `lg`), roving tabindex with arrow key focus navigation, group-level and per-item disabled states
- `slider` UI component — numeric slider with `role="slider"` and full ARIA attributes; supports `type="single"` (one thumb) and `type="range"` (two thumbs, ordered values), horizontal and vertical orientations, pointer drag and track click interaction, keyboard navigation (Arrow keys, Home/End, PageUp/PageDown), hidden `<input>` for form submission, step snapping, and `$bindable()` value

## [0.1.12] - 2026-04-08

### Added

- `select` UI component — compound dropdown select with `Select` (root), `SelectTrigger` (`role="combobox"`), `SelectValue` (placeholder/display), `SelectContent` (`role="listbox"`), `SelectItem` (`role="option"` with checkmark), `SelectGroup`, `SelectLabel`, and `SelectSeparator`; keyboard navigation (Arrow keys, Enter/Space, Escape), hidden `<input>` for form submission, disabled state, and click-outside close
- `radio-group` UI component — compound radio group with `RadioGroup` (root) and `RadioGroupItem` (button); `role="radiogroup"` / `role="radio"` with `aria-checked`, `data-state`, roving tabindex, arrow key navigation, filled circle SVG indicator, hidden `<input type="radio">` for form submission, group-level and per-item disabled states
- `label` UI component — accessible `<label>` with `for` prop, `peer-disabled` opacity handling, and `cn()` class merging
- `dialog` UI component — modal overlay with focus trap, body scroll lock, backdrop click/Escape to close, CSS animations, and full ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`); includes Dialog, DialogContent, DialogTrigger, DialogClose, DialogHeader, DialogTitle, DialogDescription, and DialogFooter sub-components
- `checkbox` UI component — accessible checkbox with `role="checkbox"` and `aria-checked` (including `"mixed"` for indeterminate), SVG check/minus icons, hidden input for form submission, focus-visible ring, and `data-state` attribute

## [0.1.11] - 2026-04-07

### Changed

- Renamed `drizzle` template to `todo` — `bosia create --template todo` replaces `--template drizzle`; the template name now reflects its purpose (a todo app) rather than the underlying ORM

## [0.1.10] - 2026-04-06

### Changed

- Restructured `todo` registry to nested subfolder pattern — each sub-component (`todo-form`, `todo-item`, `todo-list`) in its own folder with `meta.json` and barrel `index.ts`, matching the `ui/` convention
- `bosia add todo` now installs via group dependencies; `bosia add todo/todo-form` installs individual sub-components
- Moved UI component docs into `components/ui/` subfolder; added todo component docs under `components/todo/`
- Docs sidebar now supports nested nav groups — UI and Todo render as sub-groups under Components

## [0.1.9] - 2026-04-05

### Added

- Auto-detect `Cache-Control` on `/__bosia/data/` endpoint — when `cookies.get()` or `cookies.getAll()` is called during `load()` or `metadata()`, the response is marked `private, no-cache`; otherwise it's `public, max-age=0, must-revalidate` so CDNs can safely cache public page data
- Docs: dedicated Server Metadata guide — covers `metadata()` function, Open Graph/social tags, `lang`/`link` tags, data passing to `load()`, and all type references
- SEO infrastructure — `Metadata` type now supports `lang` and `link` fields; `<html lang>` is dynamic per page; `<link>` tags (canonical, hreflang) rendered in streaming SSR head
- Docs SEO — OG tags, Twitter cards, canonical URLs, and hreflang alternates on all docs pages (landing pages EN/ID + all content pages) via shared `buildSeoMeta()` helper
- `robots.txt` for docs site — static file at `docs/public/robots.txt` with sitemap reference
- `sitemap.xml` generation — post-build script scans `content/docs/` and writes `dist/static/sitemap.xml` with `<xhtml:link>` locale alternates for EN/ID pages

## [0.1.8] - 2026-04-04

### Changed

- Registry is now the single source of truth for template features — `bosia create --template drizzle` scaffolds a base skeleton then installs features (`todo`, `drizzle`) and components from the registry via `template.json`; eliminates ~20 duplicated files between the drizzle template and the registry
- `installFeature()` and `addComponent()` now accept `InstallOptions` (`skipInstall`, `skipPrompts`, `cwd`) for non-interactive, programmatic usage (used by `bosia create`)
- Registry `drizzle-index.ts` uses defensive `DATABASE_URL` check with `console.warn` instead of non-null assertion

## [0.1.7] - 2026-04-04

### Added

- Cookie secure defaults — `cookies.set()` now defaults to `{ path: "/", httpOnly: true, secure: true, sameSite: "Lax" }`; user-provided options override defaults via spread merge; `secure` is automatically disabled in dev mode so cookies work over `http://localhost`

### Changed

- Refactored drizzle template and todo feature to repository pattern — replaced loose `queries.ts` functions with `TodoRepository` (data access) and `TodoService` (business logic/validation) static classes; route files now act as thin controllers calling the service layer

## [0.1.6] - 2026-04-03

### Fixed

- Cookie RFC 6265 compliance — validate cookie names against the HTTP token spec instead of blindly `encodeURIComponent`-ing them; fixes interop with other servers/libraries that don't expect URL-encoded cookie names
- `.env` variable name validation — reject invalid identifiers (e.g. `MY-VAR`, `123BAD`) at parse time with clear error messages including filename and line number; prevents broken codegen
- `.env` parser escape sequence support — double-quoted values now process `\n`, `\r`, `\t`, `\\`, `\"` escape sequences; single-quoted values remain literal (no processing)

## [0.1.5] - 2026-04-01

### Added

- Graceful shutdown drain — on SIGTERM/SIGINT, in-flight requests are allowed up to 10s to complete before the server stops; new requests receive `503 Service Unavailable` with `Retry-After: 5`; `/_health` returns `503 { status: "shutting_down" }` so load balancers stop routing; idempotent shutdown prevents duplicate signal handling

### Fixed

- Concurrent build guard in dev — prevent overlapping `buildAndRestart()` when rapid file changes fire during an active build; queues one follow-up build instead of running builds in parallel

## [0.1.4] - 2026-03-30

### Added

- Open redirect validation on `redirect()` — rejects external URLs, protocol-relative URLs (`//evil.com`), and dangerous schemes (`javascript:`, `data:`, `vbscript:`) by default; opt in to external redirects with `redirect(303, url, { allowExternal: true })`

### Fixed

- Client-side navigation now scrolls to top when navigating to a new page (previously retained scroll position from the previous page)
- Back/forward browser navigation preserves scroll behavior (does not force scroll to top)
- Use `insertAdjacentHTML` for SSR head injection instead of `innerHTML+=` — prevents re-parsing the entire `<head>`, avoiding duplicate stylesheets and script re-execution

## [0.1.3] - 2026-03-29

### Added

- `bosia add` now resolves component paths from `registry/index.json` — top-level components like `todo` no longer get wrongly prefixed with `ui/`
- `bosia feat` now supports nested feature dependencies — `features` field in feature `meta.json` triggers recursive installation (e.g. `bosia feat todo` automatically installs `bosia feat drizzle`)
- `bosia feat` now prompts before overwriting existing files (previously silently replaced them)
- `drizzle` project template — PostgreSQL + Drizzle ORM starter with full CRUD todo demo, seed system, and REST API (`bosia create --template drizzle`)
- `drizzle` feature registry entry — `bosia feat drizzle` scaffolds DB connection singleton, schema aggregator, migrations directory, seed runner with `__bosia_seeds` tracking table, and `drizzle.config.ts`
- `todo` feature registry entry — `bosia feat todo` scaffolds todo schema, typed queries, routes with form actions, REST API, components, and seed data (depends on drizzle feature)
- `todo` component registry entry — `bosia add todo` installs todo-form, todo-item, todo-list Svelte components
- Feature registry support in `registry/index.json` — new `features` array alongside existing `components`

## [0.1.2] - 2026-03-28

### Added

- Docs site rebuilt as a Bosia app (dogfooding) — replaces Astro + Starlight with a fully Bosia-powered site at `docs/`
- Markdown pipeline with `marked` + `shiki` syntax highlighting (lazy-loaded, 6 grammars) and `gray-matter` frontmatter parsing
- File-based doc content at `docs/content/docs/` with mtime-keyed parse cache
- Docs layout with sidebar, navbar, dark mode toggle, and table of contents
- i18n support (EN + ID) via `/id/` URL prefix with locale-aware sidebar links and language switcher
- Live component preview system — `demo` frontmatter key renders interactive Svelte components above doc content (7 demos: button, badge, input, separator, avatar, card, dropdown-menu)
- Landing page with hero, features grid, and quick-start code block
- Dynamic route prerendering with `entries()` export — enumerate dynamic route params for static prerendering of `[param]` and `[...slug]` routes
- `generateStaticSite()` — merge prerendered HTML + client assets + public into `dist/static/` for static hosting (GitHub Pages, Netlify, etc.)
- GitHub Pages deployment workflow (`.github/workflows/docs.yml`)

### Changed

- Data endpoint switched from query-param (`/__bosia/data?path=...`) to path-based URLs (`/__bosia/data/guides/server-loaders.json`) — enables static hosting of data payloads for client-side navigation
- Prerendering now also generates JSON data payloads alongside HTML — client navigation works on fully static sites without a running server
- Extracted shared `dataUrl()` helper in `prefetch.ts` — eliminates duplicated URL-building logic across `App.svelte` and `prefetch.ts`
- `getVersion()` extracted to shared `$lib/utils` — eliminates duplicate implementations across server files
- `DocsSidebar` now uses `localizeUrl()` from `$lib/docs/i18n` instead of inline duplication
- Page `metadata()` now uses frontmatter `title` for dynamic `<title>` tags (e.g. `"Getting Started - Bosia Docs"`)
- `bosia add` registry URL switched from docs site API to raw GitHub (`raw.githubusercontent.com`)

### Removed

- `/api/registry/` routes from docs app — registry now served directly from GitHub

### Fixed

- Added viewport meta tag to root layout for correct mobile rendering
- Silent `catch {}` in syntax highlighter now logs errors with language context

## [0.1.1] - 2026-03-27

### Added

- Component registry — 12 Svelte 5 UI components (avatar, badge, button, card, chart, data-table, dropdown-menu, icon, input, navbar, separator, sidebar) in `registry/components/`
- Interactive component previews in docs — live, clickable demos on 7 component pages (button, badge, input, separator, avatar, card, dropdown-menu) using hydrated Svelte components via `@astrojs/svelte`
- `bosia add --local` flag for installing components from the local registry during development
- `bosia add` now auto-creates `src/lib/utils.ts` (cn utility) if it doesn't exist
- Path-based component names — `bosia add shop/cart` installs to `src/lib/components/shop/cart/`; names without a path default to `ui/` prefix
- Overwrite prompt — `bosia add` asks to replace or skip when a component already exists in the project
- Components documentation — dedicated sidebar group with individual pages for all 12 components

## [0.1.0] - 2026-03-26

### Changed

- Rename framework from `bosbun` to `bosia` — package name, CLI binary, virtual modules (`bosia:routes`), generated directory (`.bosia/`), internal endpoints (`/__bosia/`), window globals (`__BOSIA_*`), CSS classes, data attributes, documentation site, and all references
- `bosia create` template picker now uses arrow-key selection instead of typed input (powered by `@clack/prompts`)

## [0.0.8] - 2026-03-26

### Changed

- Rename `bosbun:env` virtual module to `$env` — SvelteKit-style import path (`import { VAR } from "$env"`)

### Added

- Dev server auto-restart — app process is automatically restarted when it crashes unexpectedly; stops after 3 rapid crashes within 5s to prevent crash loops
- Documentation site built with Astro Starlight — 14 pages covering getting started, routing, server loaders, API routes, form actions, middleware hooks, environment variables, styling, security, CLI reference, API reference, deployment, and SvelteKit differences
- GitHub Actions workflow for auto-deploying docs to GitHub Pages on push to `main`
- Indonesian (Bahasa Indonesia) documentation — full translation of all 15 doc pages with Starlight i18n, language switcher, and `/id/` URL prefix

### Removed

- Remove unused `renderSSR` function from `renderer.ts` (fully replaced by `renderSSRStream`)
- Remove unused `buildHtmlShell` function and `_shell` cache from `html.ts`
- Remove dead `buildHtmlShell` import from `renderer.ts`
- Un-export `STATIC_EXTS`, `DEFAULT_CSRF_CONFIG`, and `matchPattern` — internal-only, not part of public API

### Changed

- Use `splitCsvEnv` helper for CSRF/CORS origin parsing in `server.ts` — eliminates duplicate `.split(",").map().filter()` pattern

### Fixed

- Route PUT/PATCH/DELETE through `handleRequest()` — these methods now get CSRF, CORS, security headers, cookie handling, and user hooks applied consistently (previously returned bare 404 responses)
- Fix `withTimeout` timer leak — `setTimeout` is now cleared via `.finally()` when the main promise resolves, preventing dangling timers under load
- Remove duplicate static file serving — removed `@elysiajs/static` plugin; all static files now served through `resolve()` with consistent path traversal protection, CSRF, CORS, security headers, and user hooks
- Fix `_shellOpen` and `_shell` caching in dev — hoist `cacheBust` to module level so it's computed once at startup (stable within a process, fresh after dev server restart on rebuild)
- Fix client-side navigation with query strings/hashes — `currentRoute` now initialized with full path (including search + hash) for consistent deduplication; `findMatch` in both `router.navigate()` and `App.svelte` now receives only the pathname, so query-driven patterns like pagination work via client-side navigation instead of falling back to full page reloads

## [0.0.7] - 2026-03-25

### Added

- Multi-template support for `bosbun create`: interactive template picker when no `--template` flag is given; includes `default` (minimal starter) and `demo` (full-featured with hooks, API routes, blog, form actions, catch-all routes)
- GitHub Actions workflow for auto-publishing to npm on push to `main` — only publishes when `package.json` version is greater than the currently published version; prereleases tagged as `next`, stable as `latest`

### Updated

- Package description and README to better reflect the framework's identity — emphasizes file-based routing, no Node.js/Vite/adapters philosophy, and full feature set

### Changed

- Replaced 🐰 emoji branding with new block-style SVG logo across all UI templates, CLI output, and favicon; favicon now served as `/favicon.svg` instead of blank `data:,` URI

### Fixed

- `bosbun create` now pins bosbun to the current version (`^x.y.z`) instead of `*`, ensuring new projects use the same version as the CLI that created them
- Tailwind CSS binary resolution: handle bun's flat dependency hoisting — `tailwindcss` binary is now found whether deps are nested (`node_modules/bosbun/node_modules/`) or hoisted (`node_modules/`); same fix applied to `NODE_PATH` in dev, build, start, and prerender
- Client hydration crash ("Cannot read properties of undefined (reading 'call')"): when bosbun is installed via npm (not workspace symlink), `hydrate.ts` resolved `"svelte"` from the framework's location while compiled components resolved `"svelte/internal/client"` from the app's `node_modules` — two separate Svelte runtime copies with independent hydration state; fixed by forcing all `svelte` imports to resolve from the app's directory via `onResolve` in the build plugin
- `NODE_PATH` resolution for Tailwind CSS: hoisted `node_modules` path was incorrectly included in workspace setups, confusing the Tailwind CLI resolver; now only adds the parent `node_modules` to `NODE_PATH` when bosbun is actually installed as a dependency (detected via `node_modules/bosbun/` path)

## [0.0.6] - 2026-03-25

### Changed

- Renamed framework from `bunia` to `bosbun` — package name, CLI binary, virtual modules (`bosbun:routes`, `bosbun:env`), generated directory (`.bosbun/`), internal endpoints (`/__bosbun/`), window globals (`__BOSBUN_*`), CSS classes, and all documentation

## [0.0.5] - 2026-03-24

### Added

- Link prefetching: `data-bosbun-preload="hover"` prefetches on mouseenter, `data-bosbun-preload="viewport"` prefetches when link scrolls into view; attribute can be placed on ancestor elements (e.g. `<nav>`) to apply to all links inside; 5s TTL cache eliminates the network request on click

## [0.0.4] - 2026-03-23

### Added

- Request timeouts: `LOAD_TIMEOUT` (default 5s) and `METADATA_TIMEOUT` (default 3s) env vars abort slow `load()` and `metadata()` functions; set to `0` or `Infinity` to disable
- Prerender fetch timeout: `PRERENDER_TIMEOUT` env var (default 5s) aborts slow route fetches during build — prevents infinite build hangs

### Fixed

- Security: `PUBLIC_*` env vars injected into client HTML are now scoped to keys declared in `.env` files only — system env vars that happen to start with `PUBLIC_` are no longer leaked to the browser
- Streaming SSR: metadata errors now return proper error responses (correct status codes) instead of broken partial HTML; post-stream errors produce valid HTML structure; XSS-safe error message encoding via `safeJsonStringify`
- `safeJsonStringify` no longer crashes on circular references — falls back to `null` with a console error
- Security: path traversal protection on all static file serving (`/public`, `/dist/client`, prerendered pages) — resolved paths are validated to stay within allowed directories
- Cookie parsing no longer crashes on malformed percent-encoding (e.g. `%ZZ`) — falls back to raw value
- Cookie `set()` now validates `domain` and `path` (rejects `;`, `\r`, `\n`) and whitelists `sameSite` to `Strict`/`Lax`/`None` — prevents header injection

### Changed

- Route matching: routes are now sorted by priority at build time (exact → dynamic → catch-all, then segment depth); `findMatch()` does a single pass instead of 3 passes — O(n) best-case with early exit

## [0.0.3] - 2026-03-21

### Added

- Streaming SSR metadata: `metadata()` export in `+page.server.ts` sends `<title>`, `<meta>` tags in the initial HTML head before `load()` completes; 3-chunk streaming flow (head open → metadata + spinner → rendered content); `MetadataEvent` and `Metadata` types exported from `bosbun`; SEO-friendly — crawlers see metadata without JS execution; `metadata()` can return `data` object that gets passed to `load()` via `event.metadata` to avoid duplicate queries
- Form actions (SvelteKit-style): `actions` export in `+page.server.ts` for handling form POST submissions; `fail()` helper and `ActionFailure` class for returning validation errors; `ActionData` type auto-generated in `$types.d.ts`; `form` prop passed to page components; named actions via `action="?/name"` attribute; re-runs `load()` after action; proper status codes (400 for failures, 200 for success, 303 for redirects)

## [0.0.2] - 2026-03-20

### Added

- `.env` file support with `bosbun:env` virtual module: prefix-based classification (`PUBLIC_STATIC_*`, `PUBLIC_*`, `STATIC_*`, private); load order `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`; build-time codegen of `.bosbun/env.server.ts`, `.bosbun/env.client.ts`, `.bosbun/types/env.d.ts`; `window.__BOSBUN_ENV__` injected at SSR for dynamic public vars; CLI loads env before spawning subprocesses
- Graceful shutdown: SIGTERM/SIGINT handlers call `app.stop()` then `process.exit(0)`; force-exit after 10s if stop hangs
- Request body size limits: `BODY_SIZE_LIMIT` env var (`512K`, `1M`, `Infinity`, or bytes); defaults to `512K`; wired into Elysia/Bun server config for 413 enforcement before handlers run
- CSRF protection: Origin/Referer header validation on all non-safe requests (POST/PUT/PATCH/DELETE); blocked requests return 403 with a descriptive message; exports `CsrfConfig` type from `bosbun`
- CORS configuration: `CORS_ALLOWED_ORIGINS` env var (comma-separated); `getCorsHeaders()` adds `Access-Control-Allow-Origin` + `Vary: Origin` for matching origins; OPTIONS preflight returns 204 with `Access-Control-Allow-Methods/Headers/Max-Age`; exports `CorsConfig` type from `bosbun`
- Strip stack traces in production: `handleRequest` wrapped in try/catch; Elysia `.onError()` safety net; all `console.error` calls log full error in dev and message-only in prod

### Removed

- Duplicate `PageLoadEvent` and `LayoutLoadEvent` interfaces from template `app.d.ts`; use `import type { LoadEvent } from "bosbun"` instead

### Fixed

- XSS: escape `<`, `>`, `&`, U+2028, U+2029 in JSON embedded in SSR `<script>` tags (`safeJsonStringify`)
- SSRF: validate `path` query param on `/__bosbun/data` — reject non-root-relative paths, double-slash URLs, and traversal sequences

## [0.0.1] - 2026-03-19

### Added

#### Core Framework

- **SSR + Svelte 5 Runes** — Server-side rendering with full Svelte 5 Runes support (`$props`, `$state`, etc.)
- **File-based routing** — Automatic route discovery via `src/routes/` directory structure (`+page.svelte`, `+page.server.ts`, `+layout.svelte`, `+layout.server.ts`, `+server.ts`)
- **Dynamic routes** — `[param]` segments with typed params
- **Catch-all routes** — `[...catchall]` segments for wildcard matching
- **Route groups** — `(group)` directory syntax for layout grouping without URL segments
- **API routes** — `+server.ts` files for REST endpoints (GET, POST, etc.)
- **Error pages** — `+error.svelte` for custom error handling with HTTP status codes

#### Data Loading

- **`load()` function** — Plain `export async function load({ params, cookies })` pattern (no wrapper needed)
- **`$types` codegen** — Auto-generated `.bosbun/types/src/routes/**/$types.d.ts` per route directory
  - `PageData`, `PageProps` for pages
  - `LayoutData`, `LayoutProps` for layouts
  - `import type { PageData } from './$types'` resolves transparently via `tsconfig.json` `rootDirs`

#### Server

- **ElysiaJS server** — Runs on port 3001 (dev) / 3000 (prod)
- **Gzip compression** — Automatic response compression
- **Static file caching** — Cache-Control headers for assets
- **`/_health` endpoint** — Returns `{ status: "ok", timestamp }` for health checks
- **Cookie support** — `Cookies` interface on `RequestEvent` and `LoadEvent`
  - `cookies.get(name)` / `cookies.set(name, value, options)` / `cookies.delete(name)`
  - `Set-Cookie` headers applied automatically in response

#### Client

- **Client-side hydration** — Full hydration of SSR-rendered pages
- **Client-side router** — SPA navigation without full page reloads
- **Navigation progress bar** — Visual loading indicator during page transitions
- **HMR** — Hot module replacement in development
- **CSR opt-out** — Per-page option to disable client-side rendering (`export const csr = false`)

#### Build

- **Bun build pipeline** — Fast bundling via Bun with Svelte plugin
- **Client bundle** — Output to `dist/client/`
- **Server bundle** — Output to `dist/server/index.js`
- **Manifest** — `dist/manifest.json` for route/asset mapping
- **Static prerendering** — Opt-in prerendering of routes at build time (`export const prerender = true`)
- **Tailwind CSS v4** — Integrated via `@tailwindcss/cli`
- **`$lib` alias** — `$lib/*` maps to `src/lib/*`
- **`bosbun:routes` virtual module** — Auto-generated route registry at build time

#### CLI

- **`bosbun dev`** — Start dev server with file watching and HMR
- **`bosbun build`** — Production build
- **`bosbun start`** — Start production server from `dist/server/index.js`
- **`bosbun create`** — Scaffold a new project from the default template

#### Hooks

- **`hooks.server.ts`** — `Handle` middleware interface with `sequence()` helper
- **`RequestEvent`** — `request`, `params`, `url`, `cookies`, `locals`
- **`LoadEvent`** — `params`, `url`, `cookies`, `locals`

#### Developer Experience

- **Default project template** — `packages/bosbun/templates/default/` for `bosbun create`
- **Dockerfile** — Multi-stage Docker build for the demo app
- **TypeScript** — Full type coverage; `tsconfig.json` auto-patched on first build
- **README** — Monorepo, framework, demo app, and template READMEs

## [0.0.0] - 2026-03-19

### Added

- Initial framework scaffolding: `matcher.ts`, `scanner.ts`, `types.ts`
- Core SSR server (`server.ts`) and client router (`App.svelte`, `router.svelte.ts`)
- Client-side hydration with HMR support (`hydrate.ts`)
- Dev server with proxy and file watcher (`dev.ts`)
- CLI entry point with `dev`, `build`, `start`, `create` commands
- Demo application (`apps/demo/`)
