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

Correct file-routing under `src/routes/` — no 404 traps, no missing page data.

When: adding a page/layout/endpoint/API route, wiring a `<form>` POST, or a page that needs a parent layout's value. Anti-trigger: component work not touching `src/routes/`.

## Rules

R1 — `+page.svelte` registers the route. A folder with only `+page.server.ts` is invisible to the router — the page AND its `actions` return 404.

R2 — Action-only endpoints (logout, POST handlers, webhooks) use `+server.ts` with named verb exports; `<form method="POST" action="/logout">` hits `POST`.

```ts
// src/routes/logout/+server.ts
export async function POST() {
	return new Response(null, { status: 303, headers: { Location: "/login" } });
}
```

R3 — Page data ≠ layout data. `+page.svelte`'s `data` holds ONLY its own loader output (+ `params`); Bosia keeps pageData/layoutData separate (no SvelteKit auto-merge). To read a parent `+layout.server.ts` value, add `+page.server.ts` calling `parent()`:

```ts
// src/routes/(private)/dashboard/+page.server.ts
export async function load({ parent }) {
	const { user } = await parent();
	return { user };
}
```

R4 — Groups & dynamic segments: `(group)/` invisible in URL, shares layouts (`(public)`, `(private)`); `[param]/` → `params.param`; `[...rest]/` catch-all.

R5 — Layout chain: `+layout.svelte` wraps children; `+layout.server.ts` loads for the subtree; `+error.svelte` renders to its depth; `scope` (`public`/`private`) inherits from the nearest layout that sets it.

R6 — Authenticated UI MUST live under `(private)`. Any route reading `locals.user` / `locals.can()` (dashboard, admin/\*, settings, internal CRUD) goes under `(private)/`, never `(public)/`. Test: "Okay with a signed-out stranger loading this URL?" — No / unsure → `(private)`. If `(private)/+layout.server.ts` is missing, CREATE it to enforce session presence — don't demote routes to `(public)` to work around it.

❌ `src/routes/(public)/admin/produk/+page.svelte`
✅ `src/routes/(private)/admin/produk/+page.svelte`

## Workflow

1. Decide shape: UI page → `+page.svelte` (+ optional `+page.server.ts`); action-only → `+server.ts`; shared shell → `+layout.*`.
2. Group: public marketing → `(public)`; authenticated → `(private)`.
3. If the page reads layout values, add `+page.server.ts` with `await parent()`.
4. Private routes enforce `can()` in their loader/action/handler (see bosia-rbac-permission).

## Checklist

P0:

- [ ] Folder has `+page.server.ts` but no `+page.svelte` → add `+page.svelte` or move logic to `+server.ts`.
- [ ] Page reads a layout-loader value → has `+page.server.ts` calling `parent()`.
- [ ] Form `action` URL resolves to a `+page.server.ts` `actions` (with `+page.svelte`) OR a `+server.ts` handler.
- [ ] Private route enforces RBAC.
- [ ] No `admin/*`, `dashboard`, `settings` under `(public)`.

P1:

- [ ] Groups used to share layouts.
- [ ] `+error.svelte` at appropriate depth.
- [ ] `trailingSlash` exported from a server module, not a page.

Related: bosia-svelte-runes (`$props()` not `export let`), bosia-elysia-routes (`+server.ts` shape), bosia-navigation (`goto`/`beforeNavigate` from `bosia/client`), bosia-rbac-permission.

Source: `bosia/packages/bosia/src/core/scanner.ts` (registration), `renderer.ts` (data separation).
