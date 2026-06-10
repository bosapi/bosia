---
name: bosia-sidebar
description: App-shell sidebar — composable `Sidebar`, `SidebarMenu`, `SidebarMenuItem` (auto leaf/parent), `SidebarFooter` with working user menu via `DropdownMenu` + `Avatar`. Use when building any dashboard or admin layout that needs left-rail navigation with collapse + user dropdown.
triggers:
    - sidebar
    - side nav
    - side-nav
    - left rail
    - app shell
    - admin layout
    - dashboard layout
    - collapsible nav
    - user menu
    - profile menu
    - logout button
    - SidebarMenuItem
    - SidebarFooter
od:
    mode: convention
    category: framework
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: [ui/sidebar, ui/dropdown-menu, ui/avatar]
        feats: []
    targets:
        routes: []
    stack: [svelte-5-runes]
---

# bosia-sidebar

## STOP — three failures this skill exists to prevent

1. **Wrapping a leaf `SidebarMenuItem` in a `DropdownMenu` (or any foreign trigger)** — the `href` is swallowed and the link becomes un-clickable. `SidebarMenuItem` already branches on its own props; never wrap it.
2. **Skipping the user footer** because the doc's stub example only shows `v0.1.0`. Every signed-in app needs avatar + name + email in `SidebarFooter`.
3. **Building the user row as plain markup** so Profile / Settings / Sign out have nowhere to live. Compose `DropdownMenu` + `Avatar` from the registry — don't hand-roll a popover.

## What it builds

A complete left-rail app shell:

- Header with logo + brand text (collapses to logo-only).
- One or more `SidebarGroup`s mixing leaf links (Dashboard, Settings) and collapsible parents (Analytics → Overview / Reports).
- Footer with a working user dropdown — avatar row triggers a menu with Profile, Settings, Sign out.
- `SidebarTrigger` wired with `bind:collapsed` so icon-mode works.

## When to use

- Any `(private)/+layout.svelte` building a dashboard or admin shell.
- Apps that need a persistent nav + collapsed icon mode.
- Any layout where the signed-in user expects an avatar dropdown in a stable corner.

Anti-trigger: marketing/landing pages — use `ui/navbar` instead, sidebar is for in-app shells.

## Rules

### R1 — `SidebarMenuItem` picks its own shape

The component auto-branches:

| Use case               | Pass                                                       |
| ---------------------- | ---------------------------------------------------------- |
| Plain link             | `href` + `label`, **no** children                          |
| Section with sub-items | `label` + nested `SidebarMenuItem` children, **no** `href` |
| Label-only (no nav)    | `label` only                                               |

```svelte
<!-- ✅ leaf -->
<SidebarMenuItem href="/dashboard" label="Dashboard" />

<!-- ✅ parent -->
<SidebarMenuItem label="Analytics">
	<SidebarMenuItem href="/analytics/overview" label="Overview" />
	<SidebarMenuItem href="/analytics/reports" label="Reports" />
</SidebarMenuItem>
```

`href` xor children — never both. If both are passed, the children path wins and the `href` is dropped.

### R2 — Never wrap `SidebarMenuItem` in another trigger

```svelte
<!-- ❌ swallows href, breaks the link -->
<DropdownMenu>
	<DropdownMenuTrigger>
		<SidebarMenuItem href="/dashboard" label="Dashboard" />
	</DropdownMenuTrigger>
</DropdownMenu>

<!-- ✅ just use the link form -->
<SidebarMenuItem href="/dashboard" label="Dashboard" />
```

`SidebarMenuItem` already renders a button (parent) or anchor (leaf). Wrapping it in `DropdownMenu`, `Popover`, or a `<button>` makes the inner element non-functional.

### R3 — Icons go in the `icon` snippet, not as children

`children` is reserved for nested menu items. Icons use the `icon` snippet:

```svelte
<SidebarMenuItem href="/dashboard" label="Dashboard">
	{#snippet icon()}<LayoutDashboard size={16} />{/snippet}
</SidebarMenuItem>
```

Import icons from `@lucide/svelte` (see [[bosia-icon]]) — not `lucide-svelte` (deprecated).

### R4 — Collapse state lives on `Sidebar`, mirrored to `SidebarTrigger`

```svelte
<script lang="ts">
	let collapsed = $state(false);
</script>

<Sidebar collapsible="icon" bind:collapsed>
	<!-- … -->
</Sidebar>

<SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />
```

`bind:collapsed` belongs on `Sidebar`. `SidebarTrigger` receives the same value as a regular prop plus an `onclick` that flips it. Don't read collapse state via `localStorage` or a custom store — `getSidebarContext()` is the supported reader inside the tree.

### R5 — User footer composes existing registry pieces

The framework doesn't ship a `SidebarUser` component on purpose. Build the footer from `SidebarFooter` + `Avatar` + `DropdownMenu`:

```svelte
<script lang="ts">
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

`sidebar = getSidebarContext()` reads `collapsed` so the name/email row hides in icon mode while the avatar stays clickable.

### R6 — `DropdownMenuContent` must be `floating side="top"` inside a sidebar

The default `DropdownMenuContent` uses `position: absolute`. `Sidebar` has `overflow-hidden` (needed for the collapse width transition), so a non-floating menu is **clipped invisible** — the user clicks and nothing appears. Always pass:

| Prop       | Value   | Why                                                                   |
| ---------- | ------- | --------------------------------------------------------------------- |
| `floating` | `true`  | Switches to `position: fixed` so the menu escapes `Sidebar` overflow. |
| `side`     | `"top"` | Opens upward — the user trigger sits at the bottom of the rail.       |
| `anchor`   | element | See R6.6 — anchor the menu to the chevron, not the whole row.         |

### R6.5 — Pass `class="block w-full"` to `DropdownMenu` for full-width triggers

The `DropdownMenu` root is `relative inline-block` so the dropdown sizes to its trigger. Inside a sidebar footer that's wrong — the trigger's `w-full` collapses to content-width, `justify-between` has nothing to space, and the chevron ends up clustered next to the name instead of at the right edge. Override:

```svelte
<DropdownMenu class="block w-full">
	<DropdownMenuTrigger class="flex w-full items-center justify-between ...">
```

Use `justify-between` (not `justify-start`) and split the trigger into two children — left group (avatar + name+email) and right chevron. Apply `min-w-0` + `truncate` on the name/email column so a long email doesn't push the chevron off-screen.

### R6.6 — Anchor the menu to the chevron, and rotate it with `open`

By default `floating` computes its position from the trigger button's rect — the whole avatar row. That makes the menu pop up over the avatar, which feels disconnected. Pass `anchor={chevronEl}` so the menu opens _from the chevron's location_ instead.

Two consequences for the markup:

1. Lucide icons don't expose their underlying SVG via `bind:this`. Wrap the icon in a `<span bind:this={chevronEl}>` so you can grab a DOM node for the anchor.
2. `bind:open` on `DropdownMenu` exposes the menu state to your trigger so you can rotate the chevron — points down when closed, up when open. Use `style:transform` (transitions cleanly) over swapping `ChevronUp`/`ChevronDown` (re-mounts the element, breaks animation).

```svelte
{#if !sidebar.collapsed}
	<span
		bind:this={chevronEl}
		class="inline-flex shrink-0 items-center transition-transform duration-150"
		style:transform={open ? "rotate(0deg)" : "rotate(180deg)"}
	>
		<ChevronUp size={14} />
	</span>
{/if}
```

Pair with `align="end"` on `DropdownMenuContent` so the menu's right edge aligns to the chevron's right edge.

### R7 — `trigger="hover"` is opt-in, never the default

Per `SidebarMenuItem`, `trigger="hover"` opens the collapsed popover on hover. Use it sparingly — desktop-only navigation menus where the user is mousing along the rail. Mobile/touch falls back to tap-to-toggle automatically. Don't apply `trigger="hover"` to every parent item; on touch devices it's just an extra tap.

## Workflow

1. **Install the pieces in one call.**

    ```bash
    bun x bosia@latest add sidebar dropdown-menu avatar
    ```

    (`@lucide/svelte` is already a dep of the icon-using components; see [[bosia-icon]].)

2. **Define the nav structure.** List routes the app exposes. Mark each as leaf, parent (with children), or label-only per R1. Don't ship a sidebar with one item — scaffold ≥3 (matches [[bosia-navigation]] R7).

3. **Wire collapse state at the layout root.**

    ```svelte
    <script>
    	let collapsed = $state(false);
    </script>

    <Sidebar collapsible="icon" bind:collapsed>…</Sidebar>
    ```

4. **Build the user footer with `DropdownMenu`.** Pull `user` from layout data (typically `(private)/+layout.server.ts` per [[bosia-dashboard]] / [[bosia-page-shell]]). `onLogout` POSTs to a `+server.ts` action, never a plain link.

5. **Verify by clicking each item.** Leaves navigate, parents toggle/popover, user dropdown opens, Sign out triggers the POST.

## Bosia conventions

- [[bosia-navigation]] — the canonical place for "use the registry sidebar, scaffold ≥3 items." This skill is the deep dive on composition.
- [[bosia-dashboard]] — the larger page-scaffold that consumes this sidebar in `(private)/+layout.svelte`.
- [[bosia-page-shell]] — sidebars belong in the layout, never re-rendered inside each `+page.svelte`.
- [[bosia-icon]] — `@lucide/svelte` (scoped) for the `icon` snippet; never `lucide-svelte`.
- [[bosia-auth-flow]] — Sign out POSTs to a `+server.ts` so the session cookie clears server-side.

## Checklist gate

P0:

- [ ] No `SidebarMenuItem` is wrapped in a `DropdownMenu`, `Popover`, or `<button>`.
- [ ] Leaf items pass `href` only; parents pass children only; never both.
- [ ] Icons use the `icon` snippet, imported from `@lucide/svelte`.
- [ ] `bind:collapsed` is on `Sidebar`; `SidebarTrigger` gets `collapsed` + `onclick`.
- [ ] `SidebarFooter` contains a working `DropdownMenu` with Sign out wired to a `+server.ts` POST.
- [ ] `DropdownMenuContent` has `floating side="top"` so it escapes `Sidebar`'s `overflow-hidden`, plus `anchor={chevronEl}` + `align="end"` so the menu opens from the chevron.
- [ ] `DropdownMenu` gets `class="block w-full"` and `DropdownMenuTrigger` uses `justify-between` with two children, so the chevron sits on the right edge of the footer.
- [ ] Chevron is wrapped in a `<span bind:this={chevronEl}>` and rotates via `style:transform` driven by `bind:open` on `DropdownMenu`.
- [ ] Sidebar has ≥3 nav items (per [[bosia-navigation]] R7).

P1:

- [ ] `trigger="hover"` only on items where hover-to-expand is a deliberate desktop affordance.
- [ ] Active route gets `active` on its `SidebarMenuItem` (compare with `page.pathname` from `bosia/client`).
- [ ] Theming via `--sidebar-*` and `--color-sidebar-*` custom properties, not inline overrides.

## References

- Component source: `registry/components/ui/sidebar/sidebar-menu-item.svelte` — see the `hasChildren = $derived(!!children)` branching that R1 relies on.
- Demo: `docs/src/lib/components/demos/SidebarDemo.svelte` — full layout with collapsible groups + footer.
- User-facing doc: `docs/content/docs/components/ui/sidebar.md`.
