---
name: bosia-page-shell
description: Page shell hygiene — navbar/footer/sidebar live in `+layout.svelte` (one place), never duplicated per page. Authenticated layouts render `ui/navbar` with the avatar-dropdown `user` prop. Lists of rows always use `ui/data-table`, never a hand-rolled `<table>`.
triggers:
    - navbar
    - footer
    - sidebar
    - layout
    - app shell
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

## What it builds

Consistent app chrome. Navbar, footer, and sidebar live in `+layout.svelte` files at the right depth — never re-rendered inside `+page.svelte`. Authenticated layouts show the signed-in user via `ui/navbar`'s avatar dropdown. Tabular data uses `ui/data-table`.

## When to use

- Adding a new page under `(public)` or `(private)`.
- Wiring login → avatar dropdown.
- Rendering a list/grid of records.
- Reviewing a page that re-declares navbar markup inside `+page.svelte`.

Anti-trigger: standalone marketing block / non-app surface (e.g. embedded iframe widget).

## Rules

### R1 — Chrome belongs in `+layout.svelte`, not `+page.svelte`

Navbar, footer, sidebar, and any persistent shell render **once** in a layout file. A page that imports `Navbar` and renders it inside `+page.svelte` is a bug — it duplicates on every route, flickers on nav, and drifts as pages diverge.

❌ Anti-pattern:

```svelte
<!-- src/routes/(private)/dashboard/+page.svelte -->
<script lang="ts">
	import { Navbar } from "$lib/components/ui/navbar";
	let { data } = $props();
</script>

<Navbar {links} user={data.user} currentPath="/dashboard" /><main>…</main>
```

✅ Correct — navbar in layout, page renders only its own content:

```svelte
<!-- src/routes/(private)/+layout.svelte -->
<script lang="ts">
	import { Navbar } from "$lib/components/ui/navbar";
	import { page } from "bosia/client";
	let { children, data } = $props();

	const links = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Users", href: "/users" },
	];
</script>

<Navbar {links} currentPath={page.url.pathname} user={data.user} />
<main class="container mx-auto px-4 py-6">
	{@render children()}
</main>
```

```svelte
<!-- src/routes/(private)/dashboard/+page.svelte -->
<script lang="ts">
	let { data } = $props();
</script>

<h1>Dashboard</h1>
<!-- page-only content; no Navbar here -->
```

### R2 — Layout depth = scope

Pick the shallowest layout that needs the chrome:

| Layout                                                  | Holds                                                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/routes/+layout.svelte`                             | App-wide chrome shared by both `(public)` and `(private)`. Often empty / theme provider only. |
| `src/routes/(public)/+layout.svelte`                    | Marketing navbar + footer (no avatar — visitor is signed out).                                |
| `src/routes/(private)/+layout.svelte`                   | Authenticated navbar (with avatar dropdown) + optional sidebar/footer.                        |
| Section layouts (e.g. `(private)/admin/+layout.svelte`) | Sub-section sidebar, nested chrome.                                                           |

Don't render the authenticated navbar in the root `+layout.svelte` — it leaks across the public/private boundary.

### R3 — Authenticated layout passes `user` to `ui/navbar`

When the user is signed in, the navbar **must** receive the `user` prop so the avatar dropdown appears (Profile / Settings / Log out). Without it, the user has no visible way to sign out.

```ts
// src/routes/(private)/+layout.server.ts
import { redirect } from "bosia";
import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	if (!locals.user) throw redirect(303, "/login");

	const u = locals.user;
	return {
		user: {
			name: u.name,
			email: u.email,
			initials: u.name
				.split(" ")
				.map((p) => p[0])
				.join("")
				.slice(0, 2)
				.toUpperCase(),
			avatar: u.avatarUrl,
		},
	};
}
```

```ts
// src/routes/(private)/+layout.ts (or the layout component reads `data.user`)
```

```svelte
<!-- src/routes/(private)/+layout.svelte -->
<Navbar {links} currentPath={page.url.pathname} user={data.user} />
```

Pair the `Log out` item with a `POST /logout` (`+server.ts`) — see `bosia-routing` R2.

### R4 — Public layout omits the `user` prop

On `(public)` routes (landing, login, register), call `<Navbar {links} currentPath=… />` without `user`. The dropdown is hidden by design when `user` is `undefined`.

### R5 — Tables of rows use `ui/data-table`

Any view that lists records (users, orders, products, audit log) renders through `ui/data-table` — not a hand-rolled `<table>`, not a `<ul>` of cards pretending to be a table. Data-table ships sorting, filtering, pagination, empty state, loading skeleton.

❌ Anti-pattern:

```svelte
<table>
	<thead><tr><th>Name</th><th>Email</th></tr></thead>
	<tbody>
		{#each users as u}
			<tr><td>{u.name}</td><td>{u.email}</td></tr>
		{/each}
	</tbody>
</table>
```

✅ Correct:

```svelte
<script lang="ts">
	import { DataTable } from "$lib/components/ui/data-table";
	import type { ColumnDef, TableState } from "$lib/components/ui/data-table";

	type User = { id: string; name: string; email: string };
	let { data } = $props();

	const columns: ColumnDef<User>[] = [
		{ id: "name", accessorKey: "name", header: "Name" },
		{ id: "email", accessorKey: "email", header: "Email" },
	];

	function onStateChange(state: TableState) {
		const params = new URLSearchParams({
			limit: String(state.pagination.pageSize),
			offset: String(state.pagination.page * state.pagination.pageSize),
		});
		goto(`?${params}`);
	}
</script>

<DataTable {columns} data={data.rows} totalRows={data.total} pageSize={10} {onStateChange} />
```

Drive `data.rows` + `data.total` from the loader → repository call. See `bosia-query-defaults` for the `{ limit, offset, orderBy }` contract that backs `totalRows` and `pageSize`.

### R5.5 — Child layout `load` must spread parent data, not replace it

SvelteKit merges layout data **per depth**: each `+layout.server.ts` returns its own object, which becomes `data` at that level. Children do NOT auto-inherit parent keys — they have to ask for them via `await event.parent()` and spread them.

**Bug pattern observed:** root `+layout.server.ts` returns `{ user, cartCount }`; `(private)/+layout.server.ts` returns `{ user }`; `data.cartCount` is then **undefined** on every private page and the cart badge silently disappears.

```ts
// ❌ Wrong — replaces inherited keys at this depth
// src/routes/(private)/+layout.server.ts
export async function load({ locals }) {
	return { user: locals.user };
}
```

```ts
// ✅ Right — spread parent, override only what changes
// src/routes/(private)/+layout.server.ts
export async function load(event) {
	const parent = await event.parent();
	if (!event.locals.user) throw redirect(303, "/login");
	return { ...parent, user: event.locals.user };
}
```

Alternative for dynamic per-route data (cart count, notification count): fetch from `/api/...` via a `$effect` on the client rather than threading through layout data.

### R6 — Active link state comes from the layout

`ui/navbar` highlights the active link via `currentPath`. Source it from `page.url.pathname` (imported from `bosia/client`) inside the layout — never hardcode.

## Workflow

1. **Identify scope.** Public-only? `(public)/+layout.svelte`. Authenticated? `(private)/+layout.svelte`. Both? Root layout.
2. **Install navbar:** `bun x bosia@latest add navbar` (also pulls `button`, `avatar`, `dropdown-menu`, `icon`).
3. **Wire `+layout.server.ts`** to produce `user` (private) or omit it (public).
4. **Render `<Navbar …>` in `+layout.svelte`** above `{@render children()}`.
5. **Remove any `Navbar`/`Footer` imports from `+page.svelte` files** that the layout now owns.
6. **For list pages**, install `bun x bosia@latest add data-table` and replace any hand-rolled `<table>`.
7. **Logout endpoint:** `src/routes/logout/+server.ts` with `POST` returning a 303 redirect (see `bosia-routing` R2).

## Bosia conventions

- `bosia-routing` — `(public)` / `(private)` groups + `+layout.server.ts` rules.
- `bosia-navigation` — `page.url.pathname` import from `bosia/client`; logout uses `window.location.href` if it must tear down client state.
- `bosia-auth-flow` — login redirects + session shape feeding the layout `user`.
- `bosia-query-defaults` — repository pagination/order contract that powers data-table's `totalRows`.
- `bosia-rbac-permission` — gate the layout loader, not just child pages.

## Checklist gate

P0:

- [ ] Navbar / footer / sidebar declared in a `+layout.svelte`, not in any `+page.svelte`.
- [ ] `(private)/+layout.svelte` passes `user={data.user}` to `<Navbar>` so the avatar dropdown (with Log out) is reachable.
- [ ] `(public)` layouts do NOT pass `user` (visitor is signed-out).
- [ ] Lists of records use `<DataTable …>` — no hand-rolled `<table>` in page code.
- [ ] `currentPath` comes from `page.url.pathname`, not a string literal.
- [ ] `logout/+server.ts` exists; navbar dropdown's Log out hits it.

P1:

- [ ] Section layouts (e.g. admin sidebar) live in their own `(private)/<section>/+layout.svelte`.
- [ ] `data-table`'s `onStateChange` is wired to the URL (`limit` / `offset` query params).
- [ ] Empty + loading + error states covered via `bosia-empty-states`.

## References

- `docs/content/docs/components/ui/navbar.md` — full `Navbar` prop surface.
- `docs/content/docs/components/ui/data-table.md` — `ColumnDef`, `TableState`, server-side wiring.
- `docs/content/docs/guides/routing.md` — layout chain mechanics.
