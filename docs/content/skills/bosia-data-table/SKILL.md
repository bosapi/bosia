---
name: bosia-data-table
description: Lists of rows always render through `ui/data-table` — never a hand-rolled `<table>` or `<ul>` of cards. Wires column defs + server pagination/sort against the `bosia-query-defaults` repository signature `{ rows, total }`.
triggers:
  - data table
  - data-table
  - table
  - list
  - list view
  - admin list
  - rows
  - data grid
  - crud table
  - paginate
  - column definitions
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: [ui/data-table, ui/empty, ui/skeleton]
    feats: []
  targets:
    routes:
      - "src/routes/**/+page.svelte"
      - "src/routes/**/+page.server.ts"
  stack: [svelte-5-runes]
---

# bosia-data-table

## What it builds

A correctly-wired list view: `<DataTable>` from the registry, driven by `data.rows` + `data.total` from a server loader, with column definitions and a `onStateChange` handler that pushes pagination/sort to the URL.

## When to use

- Any page that renders **more than 5 rows** of the same shape (users, orders, products, audit log, payments).
- Admin CRUD list. Always.

Anti-trigger:

- ≤5 rows where a vertical card layout is clearer (e.g. "Recent activity" on a dashboard).
- Rich heterogeneous content (mixed cards / media); use a custom layout.

## Rules

### R1 — Install + import

```ts
bosia_add({ items: ["ui/data-table", "ui/empty", "ui/skeleton"] });
```

```ts
import { DataTable } from "$lib/components/ui/data-table";
import type { ColumnDef, TableState } from "$lib/components/ui/data-table";
```

Never copy/paste a raw `<table>` "just for this list". The hand-rolled table costs you sorting, pagination, empty state, loading skeleton, keyboard nav, and a11y semantics — and every other list view in the same app drifts from it.

### R2 — Column definitions are typed

Type the row shape; type the columns against it:

```ts
type User = { id: string; name: string; email: string; createdAt: Date };

const columns: ColumnDef<User>[] = [
	{ id: "name", accessorKey: "name", header: "Name", sortable: true },
	{ id: "email", accessorKey: "email", header: "Email" },
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: "Joined",
		cell: (row) => row.createdAt.toLocaleDateString(),
	},
];
```

Cell renderers go through `cell: (row) => ...` — never push formatting back into the loader.

### R3 — Loader returns `{ rows, total }`, default sort `desc(createdAt)`

The repository signature is `(db, { limit=10, offset=0, orderBy?, where? })` returning `{ rows, total }` — see [[bosia-query-defaults]]. The loader extracts pagination + sort from query params, calls the repo, returns the pair:

```ts
// +page.server.ts
import { UsersRepository } from "$lib/features/users";

export async function load({ url }) {
	const limit = Number(url.searchParams.get("limit") ?? 10);
	const offset = Number(url.searchParams.get("offset") ?? 0);
	const sortField = url.searchParams.get("sort") ?? "createdAt";
	const sortDir = url.searchParams.get("dir") ?? "desc";

	return UsersRepository.list(db, {
		limit,
		offset,
		orderBy: { [sortField]: sortDir },
	});
}
```

Never `db.select()` directly from the loader — always go through the repository.

### R4 — `onStateChange` writes to the URL, doesn't `$state` locally

Pagination + sort state is **URL state**. The data-table emits state changes; the handler pushes them into the URL, the loader re-runs:

```svelte
<script lang="ts">
	import { goto } from "bosia/client";

	function onStateChange(state: TableState) {
		const params = new URLSearchParams({
			limit: String(state.pagination.pageSize),
			offset: String(state.pagination.page * state.pagination.pageSize),
			sort: state.sort?.field ?? "createdAt",
			dir: state.sort?.dir ?? "desc",
		});
		goto(`?${params}`, { keepFocus: true, noScroll: true });
	}
</script>

<DataTable {columns} data={data.rows} totalRows={data.total} pageSize={10} {onStateChange} />
```

Local `$state` for pagination breaks deep-linking and back-button restoration. Always reflect through the URL.

### R5 — Empty / loading / error via the table itself

`<DataTable>` accepts `emptySlot` / `loadingSlot` props. Wire `bosia-empty-states` slots into them — don't render a sibling "No results" block.

## Anti-patterns

- Hand-rolled `<table>` with manual `{#each}` rows.
- `<ul>` of cards pretending to be a table (no sort, no pagination, no a11y).
- Re-implementing pagination per page with local `$state` and a manual offset variable.
- Pulling all rows into the loader and paginating client-side.
- Formatting dates / currency in the loader so the row shape leaks display concerns.

## Workflow

1. Install: `bosia_add({ items: ["ui/data-table", "ui/empty", "ui/skeleton"] })`.
2. Add a typed `ColumnDef<Row>[]` next to the page.
3. Loader: read URL pagination + sort, call repository's `list`, return `{ rows, total }`.
4. Component: `<DataTable {columns} data={data.rows} totalRows={data.total} {onStateChange} />`.
5. `onStateChange` → `goto` with updated query string.
6. Wire empty + loading slots from [[bosia-empty-states]].

## Bosia conventions

- [[bosia-page-shell]] R5 — lists always go through `ui/data-table`. This skill is the deep-dive for that rule.
- [[bosia-query-defaults]] — repository signature + `{ rows, total }` contract.
- [[bosia-empty-states]] — empty / loading / error slots.
- [[bosia-crud-flow]] — when this list is the index of a CRUD resource.

## Checklist gate

P0:

- [ ] `<DataTable>` from `$lib/components/ui/data-table` — no hand-rolled `<table>` in the page.
- [ ] Columns typed against the row shape.
- [ ] Loader returns `{ rows, total }` from a repository call (no `db.select` in the loader).
- [ ] `onStateChange` writes pagination + sort to URL query params.
- [ ] Empty + loading slots wired.

P1:

- [ ] Sort default is `desc(createdAt)`.
- [ ] `pageSize` matches the repo's `limit` default (10).
- [ ] Cell formatters live in `cell:` callbacks, not in the loader.
