---
name: bosia-shop-template
description: Storefront starter scaffolded by `bosia create … --template shop`. Bundles `auth` + `rbac` + `file-upload` + `shop` registry features, `(public)` + `(private)` route shells, `PublicNavbar` + `AdminSidebar`, and a postgres-by-default Drizzle setup. Use when extending a shop scaffold — not when bootstrapping a generic Bosia app.
triggers:
  - shop template
  - storefront
  - storefront starter
  - online store
  - ecommerce starter
  - bosia create --template shop
  - admin dashboard for shop
  - products page
  - orders page
  - cart
  - PublicNavbar
  - AdminSidebar
od:
  mode: convention
  category: template
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: [auth, rbac, file-upload, shop]
  targets:
    routes: []
  stack: [svelte-5-runes]
---

# bosia-shop-template

## STOP — five failures this skill exists to prevent

1. **Re-running `bosia add feat auth|rbac|file-upload|shop`** because the consumer didn't realise the scaffold already wired them. The append-block markers (`resources.ts`, `auth-handle.ts`, `App.Locals`, `schemas.ts`) will double-append and break compilation.
2. **Replacing `src/lib/components/AdminSidebar.svelte` or `PublicNavbar.svelte` with a fresh component** instead of editing the one the scaffold shipped — you lose the working `DropdownMenu floating side="top" anchor={chevronEl}` user menu, the theme-aware logo button, and the `SidebarTrigger` collapse wiring, then spend an hour rebuilding them from `[[bosia-sidebar]]`.
3. **Adding `postgres` / `pg` / `@aws-sdk/*` to `package.json`** because the snippets you copy from the internet assume them. Bosia uses `Bun.SQL` + `drizzle-orm/bun-sql` and `Bun.s3`. The template ships with neither dep and shouldn't gain them.
4. **Building a custom "first user = admin" check** because the consumer didn't see the seed. `001_rbac_bootstrap.ts` already grants `('*','*','')` to the first registered user. Don't reimplement.
5. **Numbering new seeds `001_*.ts` / `002_*.ts`** because the consumer didn't `ls src/features/drizzle/seeds/`. Those slots are taken (`001_rbac_bootstrap`, `002_shop`). Start at `003_*`.

## What ships

| Layer       | Already wired                                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Features    | `auth`, `rbac`, `file-upload`, `shop` (all postgres-default; override per-feature in `template.json#featureOptions`)                                              |
| Auth routes | `(public)/login`, `(public)/register`, `POST /logout` (303 → `/`)                                                                                                 |
| API routes  | `POST /api/files`, `GET /uploads/[...path]/+server.ts`                                                                                                            |
| Auth gate   | `src/routes/(private)/+layout.server.ts` redirects to `/login?next=…` when `locals.user` is null                                                                  |
| Layouts     | `(public)/+layout.svelte` wraps with `PublicNavbar`; `(private)/+layout.svelte` renders `AdminSidebar` + path-derived `<Breadcrumb>` above `{@render children()}` |
| Components  | `PublicNavbar.svelte`, `AdminSidebar.svelte` (theme-aware logo, brand row, collapse trigger, avatar→DropdownMenu with POST-form Sign out)                         |
| Domain      | `src/features/shop/` — `product` / `order` / `cart` × `repository.ts` + `service.ts`, plus per-dialect schemas under `schemas/`                                   |
| RBAC        | `src/lib/rbac/resources.ts` with eight `shop.*` permissions appended; `locals.can(userId, resource, action, scope?)` available everywhere                         |
| Storage     | `STORAGE_DRIVER=s3` + `S3_*` env vars; `Bun.s3` client, `Bun.Image` compression on upload                                                                         |
| Drizzle     | One per-dialect index, migrations runner, seed runner — `bun run db:generate / db:migrate / db:seed`                                                              |
| Tailwind    | v4 with `@custom-variant dark (&:where(.dark, .dark *))` so the navbar `.dark` toggle drives `dark:` utilities                                                    |
| Static      | `public/logo-light.svg`, `logo-dark.svg`, `favicon.svg`                                                                                                           |

## When to use

- Anywhere inside an app scaffolded with `bosia create … --template shop`.
- When the user asks to add product CRUD, an order list, a checkout, an admin user page, or any feature that sits on top of the existing `(private)/dashboard/` shell.
- When asked to wire a new sidebar entry, breadcrumb, RBAC-gated page, or upload form in the shop.

Anti-trigger: a generic Bosia app (`--template default` or no template). Use `[[bosia-page-shell]]` + `[[bosia-clean-architecture]]` from scratch instead.

## Rules

### R1 — Treat the four features as already installed; never re-add

`auth`, `rbac`, `file-upload`, `shop` were installed by `bosia create`. Their append-block markers are spent. Running `bosia add feat auth` (or any of the others) will:

- duplicate rows in `src/lib/rbac/resources.ts`
- re-write `auth-handle.ts` over your edits
- duplicate `App.Locals` interface members
- append the same Drizzle schemas twice to `schemas.ts`

If you genuinely need to upgrade a feature, edit the source files directly — don't re-install.

### R2 — Extend `AdminSidebar` / `PublicNavbar`, don't replace them

Both components are scaffolded into `src/lib/components/` so consumers can edit them (the comment at the top of each file says **`<!-- EDIT THIS FILE: … -->`**). Add new items to the existing `items` array (or `links`), keep the existing `DropdownMenu` user-footer block, and reuse the existing logo `<img>` pair. Anything beyond per-prop edits demands `[[bosia-sidebar]]` rules.

```svelte
<!-- ✅ extend in place -->
const items: Item[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Customers", href: "/dashboard/customers", icon: Users },  // ← add row
    …
];
```

### R3 — New routes go under `(private)/dashboard/`, not `(private)/`

The auth gate is on `(private)/+layout.server.ts`, but the `AdminSidebar` + breadcrumb shell sits on `(private)/+layout.svelte`. New admin pages MUST live under `(private)/dashboard/<segment>/+page.svelte` so they get the sidebar, the breadcrumb derivation, and the gate — all three at once.

### R4 — Append new RBAC resources to `src/lib/rbac/resources.ts`

The file is the canonical permission registry. Add a new resource by appending a row inside the marker block:

```ts
// resources.ts
export const resources = [
	// … existing rows from auth / shop installs …
	{ resource: "customers", actions: ["read", "write", "delete"] }, // ← new
] as const;
```

Then grant via the bootstrap seed (for admin) or a new seed for non-admin grants. `locals.can("customers", "read")` will work in the next request.

### R5 — Use the existing services, never `db.select` in routes

`src/features/shop/product.service.ts`, `order.service.ts`, `cart.service.ts` are the route-facing API. `+page.server.ts` calls `ProductService.list(db, { limit, offset })` — not Drizzle directly. Repositories return `{ rows, total }` per `[[bosia-query-defaults]]`.

```ts
// ✅ +page.server.ts
import { ProductService } from "$lib/features/shop";
export async function load({ locals }) {
	return { products: await ProductService.list(locals.db, { limit: 20 }) };
}
```

### R6 — New seeds start at `003_*.ts`

`001_rbac_bootstrap.ts` and `002_shop.ts` are taken. Number the next seed `003_<descriptive_name>.ts`. The runner orders alphabetically; renumbering breaks idempotency markers in already-run installs.

### R7 — `file-upload` defaults to S3; do NOT add `@aws-sdk/*`

The S3 client is `Bun.s3` (zero deps, reads standard `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` — see `[[bosia-bun-runtime]]` and `[[bosia-file-upload]]`). Upload flows from the UI use the scaffolded `files/image-dialog` block or the `files/upload-area` block. Building a new uploader is almost never the right move.

### R8 — `POST /logout` is a `+server.ts` with `throw redirect(303, "/")`

It exists. Sign-out from the sidebar is wired to it as a real `<form method="POST" action="/logout">`. Don't add an `onclick` handler that fetches `/logout` — the framework's API-route handler treats `Redirect` correctly only when the cookie/session work happens server-side and the redirect is thrown from the handler.

## Workflow

1. **Read the scaffold first.** `fs_list src/` (or equivalent). Confirm `src/features/{auth,rbac,file-upload,shop}/`, `src/lib/components/AdminSidebar.svelte`, `src/routes/(private)/+layout.svelte`, `(public)/login,register` exist. If they don't, this isn't a shop scaffold — switch skills.
2. **Look at existing services before writing a query.** `cat src/features/shop/product.service.ts` to see the interface; reuse it.
3. **Add the route, not the feature.** New admin page = new `(private)/dashboard/<segment>/+page.svelte` (+ `.server.ts` if it needs `load` / `actions`). The breadcrumb and sidebar will follow if you also add an `items` row in `AdminSidebar.svelte`.
4. **Gate with `locals.can(...)`.** In the page's `+page.server.ts`, call `locals.can(locals.user.id, "products", "write")` early and `throw error(403, …)` if false. The first-user-admin grant covers `*,*` so the admin sees everything; non-admin users need explicit permission rows (typically inserted by a new seed or an `/admin/users` form).
5. **For new uploads, reuse `files/image-dialog`.** Import the block, bind to a `string[]` of URLs. Do not call `Bun.s3` directly from a page.
6. **For new DB tables, append to `schemas.ts` via Drizzle.** Then `bun run db:generate && bun run db:migrate`. New seed → `003_*.ts`.
7. **Run `bun run check && bun run build` before declaring done.** The shop scaffold's `tsconfig` is strict; missing types in a new service will fail check.

## Bosia conventions

- `[[bosia-auth-flow]]` — the canonical place for "POST /logout, argon2id via Bun.password, no @node-rs/argon2". The shop logout obeys it.
- `[[bosia-rbac]]` — `(userId, resource, action, scope)` model + `locals.can(...)`. The shop ships eight `shop.*` rows already; add yours alongside.
- `[[bosia-sidebar]]` — full rules for editing `AdminSidebar.svelte` (leaf vs parent, DropdownMenu floating, anchor=chevron).
- `[[bosia-dashboard]]` — companion to this skill for the broader page-scaffold pattern in `(private)/dashboard/`.
- `[[bosia-file-upload]]` — when a new flow needs uploads beyond what `image-dialog` covers.
- `[[bosia-clean-architecture]]` — repository / service layering, no `db.select` in routes.
- `[[bosia-query-defaults]]` — `{ rows, total }` shape, default sort, pagination.
- `[[bosia-bun-runtime]]` — `Bun.SQL`, `Bun.s3`, `Bun.password`, `Bun.Image`. The shop scaffold relies on all four.

## Checklist gate

P0:

- [ ] No `bosia add feat auth|rbac|file-upload|shop` calls in this turn.
- [ ] `AdminSidebar.svelte` and `PublicNavbar.svelte` were edited in place, not replaced.
- [ ] No `postgres`, `pg`, or `@aws-sdk/*` added to `package.json`.
- [ ] New admin pages live under `(private)/dashboard/`, not loose under `(private)/`.
- [ ] Any DB read goes through a `*.service.ts` (and a repository), not `db.select` in a route.
- [ ] Any new permission resource appended to `src/lib/rbac/resources.ts`; the page gates with `locals.can(...)`.
- [ ] New seed file is `003_*.ts` or later, never `001` or `002`.
- [ ] `bun run check` passes; `bun run build` passes.

P1:

- [ ] Uploads reuse `files/image-dialog` or `files/upload-area` (per `[[bosia-file-upload]]`) instead of bespoke flows.
- [ ] Theme-aware logo `<img>` pair retained in any nav edit (`hidden h-5 w-5 dark:block` + `block h-5 w-5 dark:hidden`).
- [ ] Sidebar items with sub-pages use the parent-with-children `SidebarMenuItem` shape (see `[[bosia-sidebar]]` R1) rather than a flat list of leaves.

## References

- Template source: `packages/bosia/templates/shop/`.
- Composition manifest: `packages/bosia/templates/shop/template.json`.
- Feature sources: `registry/features/{auth,rbac,file-upload,shop}/`.
- Inventory: `backup/SHOP_TEMPLATE.md` (human-facing summary of everything the scaffold ships).
