---
name: bosia-rbac-permission
description: Permission-based RBAC — always `can('resource.action', scope?)`, never `if (role === 'admin')`. Roles are mutable DB data; the app must never branch on role names.
triggers:
    - authorization
    - permission check
    - role gating
    - protected route
    - access control
od:
    mode: convention
    category: framework
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: []
        feats: [drizzle]
    targets:
        routes: []
    stack: [elysia-routes, svelte-5-runes]
---

# bosia-rbac-permission

## What it builds

Authorization that survives mutable role definitions. Adding/renaming/removing a role at runtime never requires code changes.

## When to use

Any code path that gates access: server loaders, `+server.ts` handlers, form actions, UI elements, sidebar/nav generation, badge/display logic.

## Hard rule — zero role-equality checks

**NEVER** write any of these, anywhere:

```ts
// ❌ All of these are forbidden — UI, business logic, profile, badges, sidebar.
if (role === 'admin') …
if (user.role === 'treasurer') …
if (roles.includes('super_admin')) …
{#if role === 'admin'} … {/if}
```

**Why:** roles are DB rows — runtime-mutable groupings of `(resource, action)` pairs. The app must never know role names. New roles must work without code changes. Any role-equality check creates exactly the maintenance pain we abolished from the legacy edupay role-prefixed routes.

## Rules

### R1 — Authorize with `can()`

```ts
// Server (loader, action, +server.ts)
if (!locals.can('student.create')) error(403);
if (!locals.can('student.read', { schoolId })) error(403);

// UI
{#if can('student.delete')}
  <Button onclick={…}>Delete</Button>
{/if}
```

### R2 — Resources & actions live in a registry

`lib/rbac/resources.ts` declares every `resource.action` the app uses. Permissions are validated against this registry at boot.

```ts
export const RESOURCES = {
	student: ["create", "read", "update", "delete"],
	billing: ["read", "pay"],
} as const;
```

### R3 — Scope tiers

`global` (no scope) — `school` (one scope) — `own` (the caller's own resources).

```ts
locals.can("student.read"); // global
locals.can("student.read", { schoolId }); // school-scoped
locals.can("profile.update", { ownerId: userId }); // own
```

Scope context is resolved once at the top of the loader via `resolveScope(adapter, ctx)` then passed to every check.

### R4 — Display labels read from DB

Role badges, role select dropdowns, "your role: …" display — all read `user.roles[].label` from the DB. Never branch on `role.key`.

### R5 — Sidebar / nav is generated, not hardcoded

Nav items have a `permission` field; render the item only if `can(item.permission)`. Never one-sidebar-per-role.

```ts
const NAV = [
	{ href: "/students", label: "Students", permission: "student.read" },
	{ href: "/billing", label: "Billing", permission: "billing.read" },
];
```

### R6 — Wildcards for super-admin

Super-admin role holds a single permission `*.*`. Never special-case it in code — `can()` already returns true for any check.

### R7 — Porting legacy role checks

When porting code that has `if (role === 'admin')` — invent the missing permission instead. Examples: `student.delete`, `billing.adjust`, `audit.read`. Bind the permission to whatever role the user expects; the code only sees the permission.

## Workflow

1. Identify the gate (page load, action, UI element).
2. Pick or invent a `resource.action`. Add to `lib/rbac/resources.ts` if new.
3. Resolve scope context at the top of the loader.
4. `can(...)` → error / hide / show.
5. Run `bosia-security-review` checklist.

## Anti-patterns

- Any `===` against a role key or label.
- `roles.includes(...)`.
- Hardcoded "is super admin" checks (use wildcard permission).
- Per-role sidebar configs.
- Branching on `user.role.id`.

## Checklist gate

P0:

- [ ] No role-equality checks (`grep` for `role ===`, `roles.includes`, `=== 'admin'`).
- [ ] Every protected loader / action / `+server.ts` handler calls `can()`.
- [ ] Every `{#if can('…')}` references a `resource.action` registered in `lib/rbac/resources.ts`.
- [ ] Scope context resolved at the top of the loader, not per-check.

P1:

- [ ] Nav / sidebar items declare a `permission` field; the renderer filters by `can()`.
- [ ] Role badges read `role.label` from DB, not branch on key.
- [ ] Ported legacy code converted role checks → permission checks (no carry-over).
