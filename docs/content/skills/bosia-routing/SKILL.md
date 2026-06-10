---
name: bosia-routing
description: File-based routing in Bosia — `+page.svelte` registers the route; folders with only `+page.server.ts` 404. Action-only endpoints use `+server.ts`. Page data does not auto-merge with layout data.
triggers:
  - new route
  - add page
  - server action
  - form action
  - layout data
  - logout endpoint
od:
  mode: convention
  category: framework
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, elysia-routes]
---

# bosia-routing

## What it builds

Correct file-routing layout under `src/routes/`. No 404 traps, no missing data on page mount.

## When to use

- Adding a new page, layout, action-only endpoint, or API route.
- Wiring a `<form>` POST to a server handler.
- A page needs values produced by a parent `+layout.server.ts`.

Anti-trigger: pure component work that does not touch `src/routes/`.

## Rules

### R1 — `+page.svelte` registers the route

A folder under `src/routes/` is only registered as a page when `+page.svelte` exists. A folder containing only `+page.server.ts` is **invisible to the router** — both the page and its `actions` export return 404.

### R2 — Action-only endpoints use `+server.ts`

For endpoints with no UI (logout, simple POST handlers, webhooks), create `+server.ts` with named verb exports. Form `<form method="POST" action="/logout">` then hits `POST` in `+server.ts`.

```ts
// src/routes/logout/+server.ts
export async function POST() {
	return new Response(null, { status: 303, headers: { Location: "/login" } });
}
```

### R3 — Page data ≠ layout data

`+page.svelte`'s `data` prop contains **only its own loader's output** (plus `params`). Bosia keeps `pageData` and `layoutData` separate at the renderer level. SvelteKit's auto-merge does not apply.

When a page needs a value produced by a parent `+layout.server.ts`, add a `+page.server.ts` that calls `parent()`:

```ts
// src/routes/(private)/dashboard/+page.server.ts
export async function load({ parent }) {
	const { user } = await parent();
	return { user };
}
```

### R4 — Route groups & dynamic segments

- `(group)/` — invisible in URL, shares layouts (e.g. `(public)`, `(private)`).
- `[param]/` — dynamic segment, available as `params.param`.
- `[...rest]/` — catch-all.

### R5 — Layout chain & scope

- `+layout.svelte` wraps all children.
- `+layout.server.ts` loader runs for the subtree.
- `+error.svelte` renders inside layouts up to its depth.
- `scope` (`public` / `private`) is inherited down the tree from the nearest layout that sets it.

### R6 — Authenticated UI MUST live under `(private)`

Hard rule: any route requiring a logged-in user — `dashboard`, `admin/*`, `settings`, internal CRUD, or anything that reads `locals.user` / `locals.can()` — goes under `(private)/`. **Never** `(public)/`.

Decision rule: "Would I be okay with a signed-out stranger loading this URL?" — No → `(private)`. Unsure → `(private)`.

❌ Anti-pattern:

```
src/routes/(public)/admin/produk/+page.svelte
src/routes/(public)/admin/produk/[id]/edit/+page.svelte
src/routes/(public)/dashboard/+page.svelte
```

✅ Correct:

```
src/routes/(private)/admin/produk/+page.svelte
src/routes/(private)/admin/produk/[id]/edit/+page.svelte
src/routes/(private)/dashboard/+page.svelte
```

If `(private)/+layout.server.ts` does not exist, **create it** as part of the work (it must enforce session presence). Do not work around its absence by demoting routes to `(public)`.

## Workflow

1. **Decide route shape.** UI page? → `+page.svelte` (+ optional `+page.server.ts`). Action-only? → `+server.ts`. Shared shell? → `+layout.svelte` / `+layout.server.ts`.
2. **Place under correct group.** Public marketing under `(public)`. Authenticated under `(private)`.
3. **Wire data.** If the page reads layout values, add `+page.server.ts` with `await parent()`.
4. **Run `bosia-rbac-permission` check.** Private routes need `can()` enforcement in their loader / action / handler.

## Bosia conventions

- `bosia-svelte-runes` — page components use `$props()`, not `export let`.
- `bosia-elysia-routes` — `+server.ts` shape rules.
- `bosia-navigation` — client navigation (`goto`, `beforeNavigate`, `afterNavigate`) from `bosia/client`.
- `bosia-rbac-permission` — every private route enforces a permission.

## Checklist gate

P0:

- [ ] If folder has `+page.server.ts` but no `+page.svelte` → either add `+page.svelte` or move logic to `+server.ts`.
- [ ] Page reads `data.x` where `x` comes from a layout loader → has `+page.server.ts` calling `parent()`.
- [ ] Form `action` URL exists as either a `+page.server.ts` with `actions` (and a `+page.svelte`) OR a `+server.ts` handler.
- [ ] Private route enforces RBAC in its loader / handler.
- [ ] No `admin/*`, `dashboard`, `settings`, or other authenticated routes under `(public)`.

P1:

- [ ] Route groups used to share layouts (avoid duplicating `+layout.server.ts`).
- [ ] `+error.svelte` exists at the appropriate depth for user-facing errors.
- [ ] `trailingSlash` (if set) is exported from a server module, not a page.

## References

Source of truth: `bosia/packages/bosia/src/core/scanner.ts` (route registration), `renderer.ts` (page/layout data separation).
