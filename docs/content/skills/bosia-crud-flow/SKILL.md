---
name: bosia-crud-flow
description: List + create + edit + delete a single resource. Table view + dialog form + RBAC + Drizzle service. Spans table, service, routes, UI.
triggers:
    - crud
    - resource
    - list create edit delete
    - admin resource
    - form action
    - use:enhance
    - create form
    - edit form
    - delete action
od:
    mode: flow
    category: data
bosia:
    design: false
    requires:
        blocks: []
        themes: [neutral]
        components:
            [
                ui/data-table,
                ui/dialog,
                ui/form,
                ui/field,
                ui/input,
                ui/button,
                ui/badge,
                ui/dropdown-menu,
                ui/alert-dialog,
                ui/empty,
                ui/skeleton,
            ]
        feats: [drizzle]
    targets:
        routes:
            - "src/routes/(private)/<resource>/+page.svelte"
            - "src/routes/(private)/<resource>/+page.server.ts"
            - "src/routes/(private)/<resource>/[id]/+page.svelte"
            - "src/routes/(private)/<resource>/[id]/+page.server.ts"
    stack: [svelte-5-runes, tailwind-v4, elysia-routes, drizzle]
---

# bosia-crud-flow

## STOP — route placement

All resource routes live under `(private)/<resource>/...`. Admin CRUD never goes in `(public)/`. If `src/routes/(private)/+layout.server.ts` does not exist, create it (must enforce session presence). See `bosia-routing` R6.

## What it builds

A complete CRUD surface for one resource (call it `<resource>`):

| File                                            | Purpose                                     |
| ----------------------------------------------- | ------------------------------------------- |
| `src/features/<resource>/<resource>.table.ts`   | Drizzle schema                              |
| `src/features/<resource>/<resource>.service.ts` | `list`, `get`, `create`, `update`, `delete` |
| `src/features/<resource>/<resource>.schema.ts`  | input validators (zod/valibot)              |
| `(private)/<resource>/+page.svelte`             | list + create dialog                        |
| `(private)/<resource>/+page.server.ts`          | load list; `actions: { create, delete }`    |
| `(private)/<resource>/[id]/+page.svelte`        | edit form                                   |
| `(private)/<resource>/[id]/+page.server.ts`     | load one; `actions: { update, delete }`     |

Optional: `(private)/<resource>/+layout.server.ts` if the section shares context.

## Workflow

1. **Table.** Create `<resource>.table.ts` with id (uuid), createdAt, updatedAt, plus business columns. FKs use `.references`. Generate + apply migration.
2. **Service.** `list(db, ctx)`, `get(db, id)`, `create(db, input)`, `update(db, id, patch)`, `delete(db, id)`. Pure functions; no auth.
3. **Schema.** Input shape for create + update. Reuse for both routes.
4. **Permissions.** Pick `resource.read`, `resource.create`, `resource.update`, `resource.delete`. Register in `lib/rbac/resources.ts`.
5. **List route.** `+page.server.ts` `load` → `can('resource.read', scope)` → `service.list`. `actions.create` validates → `can('resource.create')` → `service.create`. `actions.delete` validates id → `can('resource.delete', scope)` → `service.delete`.
6. **Edit route.** `[id]/+page.server.ts` `load` → `can('resource.read')` → `service.get`. `actions.update` validates → `can('resource.update', scope)` → `service.update`.
7. **UI.** List page uses `ui/data-table` + dialog with `ui/form` for create. Row actions in `ui/dropdown-menu`. Edit page uses `ui/form` with prefilled values. Destructive actions confirm via `ui/alert-dialog`.
8. **Empty / loading / error.** Apply `bosia-empty-states`.
9. **Reviews.** `bosia-design-review`, `bosia-accessibility-review`, `bosia-security-review`.

## Rules

### R1 — Service is pure

No `locals`, no HTTP. Service takes `db` and typed arguments. Auth lives in the route.

### R1.5 — Actions export shape + `use:enhance`

**Wrong** (silently does nothing, page reloads, action result lost):

```ts
export async function actions({ request, locals }) {
	/* ... */
}
```

**Right** — must be `export const actions = { default | <name>: async ({...}) => {...} }`:

```ts
// +page.server.ts
import { fail } from "@sveltejs/kit";
export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.can("resource.create")) return fail(403);
		const data = parseCreate(await request.formData());
		if (!data.ok) return fail(400, { errors: data.errors });
		const id = await service.create(db, data.value);
		return { ok: true, id };
	},
};
```

Form must use `use:enhance` from `$app/forms`, and the page reads action results from the `form` prop (NOT `data`):

```svelte
<script>
	import { enhance } from "$app/forms";
	let { data, form } = $props();
</script>

<form method="POST" action="?/create" use:enhance>
	<input name="name" />
	<button type="submit">Create</button>
</form>

{#if form?.errors}<p class="text-destructive">{form.errors.name}</p>{/if}
```

Without `use:enhance` the browser does a full reload and any `form` prop / progressive-enhancement state is gone.

### R2 — RBAC at top of every action

```ts
export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.can("resource.create")) return new Response(null, { status: 403 });
		const data = parseCreate(await request.formData());
		if (!data.ok) return fail(400, data.errors);
		const id = await service.create(db, data.value);
		return { ok: true, id };
	},
};
```

### R3 — Validation before service

Service trusts its inputs. The route's job is to never call service with garbage.

### R4 — Destructive UX

- Delete confirmation via `ui/alert-dialog`.
- Confirmation copy mentions the resource by name ("Delete student Aisyah?"), not "Are you sure?".
- Action is POST to `actions.delete` (CSRF-safe).

### R5 — Optimistic updates (P1)

Where safe (e.g. toggle), update local state immediately, reconcile on response.

### R6 — Page data ≠ layout data

If the page needs `user` from the layout loader, declare `+page.server.ts` calling `parent()` (`bosia-routing` R3).

## Bosia conventions

- `bosia-routing`, `bosia-elysia-routes`, `bosia-rbac-permission`, `bosia-drizzle-feature`.
- `bosia-empty-states` for list async branches.
- `bosia-design-review`, `bosia-accessibility-review`, `bosia-security-review`.

## Checklist gate

P0:

- [ ] All 4 actions (list/create/update/delete) RBAC-checked.
- [ ] Inputs validated at the route boundary.
- [ ] Service functions pure (no `locals`).
- [ ] Delete uses `ui/alert-dialog` confirmation; copy includes resource name.
- [ ] Logout / mutating actions are POST.
- [ ] Empty + loading + error states covered on the list view.
- [ ] `bosia-security-review` pass.

P1:

- [ ] Optimistic update on safe toggles.
- [ ] Toast feedback (`ui/sonner`) on create/update/delete.
- [ ] Pagination or virtualization at ≥ 100 rows.
- [ ] Search/filter in the table header.

## References

- `references/checklist.md` — full CRUD audit.
