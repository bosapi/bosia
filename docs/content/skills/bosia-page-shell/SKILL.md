---
name: bosia-page-shell
description: Page shell hygiene — navbar/footer/sidebar live in `+layout.svelte` (one place), never duplicated per page. Authenticated layouts render `ui/navbar` with the avatar-dropdown `user` prop. Lists of rows always use `ui/data-table`, never a hand-rolled `<table>`.
triggers:
  - navbar
  - footer
  - sidebar
  - layout
  - app shell
  - page shell
  - root layout
  - +page.svelte
  - +layout.svelte
  - chrome
  - header
  - user avatar
  - avatar dropdown
  - table
  - list view
  - layout data
  - await parent
  - data overwrite
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: [ui/navbar, ui/data-table, ui/avatar, ui/dropdown-menu]
    feats: []
  targets:
    routes:
      - "src/routes/+layout.svelte"
      - "src/routes/(public)/+layout.svelte"
      - "src/routes/(private)/+layout.svelte"
  stack: [svelte-5-runes]
---

# bosia-page-shell

> STOP. Read before writing any `+page.svelte` or `+layout.svelte`.

Consistent app chrome: Navbar/Footer/Sidebar live in `+layout.svelte` at the right depth, never inside `+page.svelte`. Authenticated layouts show the signed-in user via `ui/navbar`'s avatar dropdown. Tabular data uses `ui/data-table`.

When: adding a page under `(public)`/`(private)`, wiring login → avatar dropdown, rendering a list/grid of records, or reviewing a page that re-declares navbar markup. Anti-trigger: standalone marketing block / non-app surface.

## Rules

R1 — Chrome belongs in `+layout.svelte`, ONLY. `Navbar`/`Footer`/`Sidebar` are forbidden inside any `+page.svelte` (they'd duplicate on every route, flicker on nav, drift). Importing one from a `+page.svelte` is a bug — move it to the layout.

```svelte
<!-- ✅ (private)/+layout.svelte -->
<script lang="ts">
	import { Navbar } from "$lib/components/ui/navbar";
	import { page } from "bosia/client";
	let { children, data } = $props();
	const links = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Users", href: "/users" },
	];
</script>

<!-- ❌ (private)/dashboard/+page.svelte -->
<Navbar {links} user={data.user} />
<main>…</main>
<Navbar {links} currentPath={page.url.pathname} user={data.user} />
<main class="container mx-auto px-4 py-6">{@render children()}</main>

<!-- ✅ (private)/dashboard/+page.svelte — page-only content, no Navbar -->
<h1>Dashboard</h1>
```

R2 — Layout depth = scope. Pick the shallowest layout that needs the chrome: root `+layout.svelte` = app-wide chrome shared by both groups (often empty / theme provider); `(public)/+layout.svelte` = marketing navbar + footer (no avatar); `(private)/+layout.svelte` = authenticated navbar (avatar dropdown) + optional sidebar/footer; section layouts (`(private)/admin/+layout.svelte`) = sub-section chrome. Don't render the authenticated navbar in the root layout — it leaks across the public/private boundary. (If you DO want one shared navbar, put it in the root with `user={data.user}` conditional, and drop the group navbars to avoid double-render.)

R3 — Authenticated layout MUST pass `user` to `ui/navbar`, else signed-in users have no avatar dropdown and no way to Log out. Public and private chrome are SEPARATE components configured separately — the moment `(private)/+layout.svelte` exists it needs its own auth-aware chrome; do NOT defer it to a future turn ("dropdown will appear later"). Thread `user` from `(private)/+layout.server.ts`:

```ts
// src/routes/(private)/+layout.server.ts
import { redirect, type LoadEvent } from "bosia";
export async function load({ locals, parent }: LoadEvent) {
	if (!locals.user) throw redirect(303, "/login");
	const u = locals.user;
	return {
		...(await parent()), // R5.5 — preserve inherited keys
		user: {
			name: u.name,
			email: u.email,
			avatar: u.avatarUrl,
			initials: u.name
				.split(" ")
				.map((p) => p[0])
				.join("")
				.slice(0, 2)
				.toUpperCase(),
		},
	};
}
```

```svelte
<Navbar {links} currentPath={page.url.pathname} user={data.user} />
```

Pair the Log out item with `POST /logout` (`+server.ts`) — see bosia-routing R2.

R4 — Public layout omits `user`: `<Navbar {links} currentPath=… />` (the dropdown is hidden by design when `user` is undefined).

R5 — Tables of rows use `ui/data-table`, never a hand-rolled `<table>` or a `<ul>` of cards pretending to be one (data-table ships sorting/filtering/pagination/empty/loading).

```svelte
<script lang="ts">
	import { DataTable, type ColumnDef, type TableState } from "$lib/components/ui/data-table";
	let { data } = $props();
	const columns: ColumnDef<User>[] = [
		{ id: "name", accessorKey: "name", header: "Name" },
		{ id: "email", accessorKey: "email", header: "Email" },
	];
	function onStateChange(s: TableState) {
		goto(
			`?${new URLSearchParams({ limit: String(s.pagination.pageSize), offset: String(s.pagination.page * s.pagination.pageSize) })}`,
		);
	}
</script>

<DataTable {columns} data={data.rows} totalRows={data.total} pageSize={10} {onStateChange} />
```

Drive `data.rows`/`data.total` from the loader → repository call. See bosia-query-defaults for the `{ limit, offset, orderBy }` contract behind `totalRows`/`pageSize`.

R5.5 — Child layout `load` MUST spread parent data, not replace it. Layout data merges per depth; children don't auto-inherit parent keys — they must `await event.parent()` and spread. Bug pattern: root returns `{ user, cartCount }`, `(private)` returns `{ user }` → `data.cartCount` is undefined on every private page and the cart badge vanishes.

```ts
// ✅ return { ...(await event.parent()), user: event.locals.user };  // spread, override only what changes
```

For dynamic per-route data (cart/notification count), prefer fetching from `/api/...` via a client `$effect` over threading through layout data.

R6 — Active link state comes from the layout: source `currentPath` from `page.url.pathname` (imported from `bosia/client`) inside the layout — never hardcode.

## Workflow

1. Identify scope → which layout.
2. `bun x bosia@latest add navbar` (pulls button/avatar/dropdown-menu/icon).
3. Wire `+layout.server.ts` to produce `user` (private) or omit it (public).
4. Render `<Navbar …>` in `+layout.svelte` above `{@render children()}`.
5. Remove `Navbar`/`Footer` imports from `+page.svelte` files the layout now owns.
6. List pages: `bun x bosia@latest add data-table`, replace any hand-rolled `<table>`.
7. `src/routes/logout/+server.ts` with `POST` → 303 redirect (bosia-routing R2).

## Checklist gate

> Run BEFORE claiming "done". Quote each box with file:line evidence. P0 can be enforced via `scripts/check-shell.ts` in `bun run check`.

P0 (blockers):

- [ ] No `<Navbar>`/`<Footer>`/`<Sidebar>` tag inside any `+page.svelte` — move to the layout.
- [ ] No `from ".../ui/navbar"` (or footer/sidebar) import inside any `+page.svelte`.
- [ ] Lists of records use `<DataTable …>` — no hand-rolled `<table>`.
- [ ] `currentPath` from `page.url.pathname`, not a literal.

P1 (shell-hygiene warns; address before done):

- [ ] If `(private)/+layout.svelte` renders `<Navbar>`/`<Sidebar>`, the tag has `user={data.user}` and `(private)/+layout.server.ts` returns `user` (spread parent + override).
- [ ] `(public)` navbar correctly omits `user=`.
- [ ] `logout/+server.ts` exists; the dropdown's Log out hits it.
- [ ] Section layouts live in their own `(private)/<section>/+layout.svelte`.
- [ ] `data-table` `onStateChange` wired to URL `limit`/`offset`; empty/loading/error via bosia-empty-states.

Related: bosia-routing, bosia-navigation, bosia-auth-flow, bosia-query-defaults, bosia-rbac-permission. References: `docs/content/docs/components/ui/navbar.md`, `data-table.md`, `guides/routing.md`.
