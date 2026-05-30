---
name: bosia-auth-flow
description: Login + register + logout + forgot-password — Bun.password (NOT argon2 npm package), session cookie, RBAC bootstrap, public route group. Already-signed-in visitors bounce off /login and /register to the dashboard. A login page always ships alongside its post-login destination (no orphan auth). Spans multiple files. Uses Bun.password not argon2 npm package.
triggers:
    - auth
    - login
    - register
    - sign-up
    - sign-in
    - forgot password
    - session
    - +page.server.ts
    - cookies.set
    - password hashing
    - session cookie
    - auth route
od:
    mode: flow
    category: auth
bosia:
    design: false
    requires:
        blocks: []
        themes: [neutral]
        components: [ui/form, ui/field, ui/input, ui/button, ui/label, ui/alert]
        feats: [drizzle]
    targets:
        routes:
            - "src/routes/(public)/login/+page.svelte"
            - "src/routes/(public)/login/+page.server.ts"
            - "src/routes/(public)/register/+page.svelte"
            - "src/routes/(public)/register/+page.server.ts"
            - "src/routes/(public)/forgot/+page.svelte"
            - "src/routes/(public)/forgot/+page.server.ts"
            - "src/routes/logout/+server.ts"
    stack: [svelte-5-runes, tailwind-v4, elysia-routes, drizzle]
---

# bosia-auth-flow

## What it builds

A full auth surface wired to Drizzle + session cookies.

### Files

| File                                    | Purpose                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/features/auth/password.ts`         | Argon2id hash + verify via `Bun.password`                       |
| `src/features/auth/tokens.ts`           | session token mint + verify                                     |
| `src/features/auth/session-resolver.ts` | resolve session → `locals.user`, `locals.can`                   |
| `src/features/auth/auth-handle.ts`      | hook wiring `session-resolver` into every request               |
| `(public)/login/+page.svelte`           | login form                                                      |
| `(public)/login/+page.server.ts`        | `actions: { default }` — validate, verify, set cookie, redirect |
| `(public)/register/+page.svelte`        | register form                                                   |
| `(public)/register/+page.server.ts`     | validate, hash, insert user, RBAC bootstrap, redirect           |
| `(public)/forgot/+page.svelte`          | request-reset form                                              |
| `(public)/forgot/+page.server.ts`       | mint reset token, email (or log in dev)                         |
| `logout/+server.ts`                     | `POST` clears cookie, 303 to `/login`                           |

`logout` is `+server.ts` (not `+page.server.ts`) because it's action-only. (`bosia-routing` R2.)

## Workflow

1. **Drizzle features in place.** Confirm `users.table.ts` and `users` columns include `passwordHash`. If not, add a numbered seed/migration — never edit applied seeds (`bosia-drizzle-feature`).
2. **Install UI:** `bosia add theme/neutral ui/form ui/field ui/input ui/button ui/label ui/alert`.
3. **Implement `features/auth/password.ts`** — Argon2id via `Bun.password.hash(pw, { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 })` and `Bun.password.verify(pw, hash)`. Never `@node-rs/argon2` / `argon2` / `bcrypt` — they crash under Bun. Never SHA-only. See [[bosia-bun-runtime]].
4. **Implement `features/auth/tokens.ts`** — session tokens, opaque random 32 bytes, base64url.
5. **Implement `auth-handle.ts`** — reads `session` cookie, loads user + materialized permissions, sets `locals.user`, `locals.can`.
6. **Routes:** login, register, forgot, logout. Each `+page.server.ts` validates input, returns shape errors via SvelteKit-style `fail()` or a custom return.
7. **RBAC bootstrap on register** — first user becomes super-admin via the bootstrap seed (or assign `*.*` directly if seed already ran).
8. **Run `bosia-security-review`.**

## Rules

### R1 — Password hashing

Use `Bun.password.hash(pw, { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 })` and `Bun.password.verify(pw, hash)`. Never `@node-rs/argon2` or `argon2` npm packages — their NAPI bindings crash under Bun. Never plain SHA / unsalted bcrypt. See [[bosia-bun-runtime]].

### R2 — Cookie flags

Set `HttpOnly` (default), `SameSite=Lax` (default), `Path=/` (default), and `Max-Age=<session_ttl>`. **Omit `secure` in route code** — Bosia inspects the request transport per-request and adds `Secure` only when the request is HTTPS. Passing `secure: true` literal on an HTTP transport triggers a downgrade + warn (silent login loop avoided). See [[bosia-cookies]].

### R3 — Validate at the boundary

Form actions parse `formData` and validate (zod / hand). Reject with field-level errors, no silent coercion.

### R4 — Rate limit

`/login`, `/register`, `/forgot` — per-IP and per-account limiters. Bypass for dev only.

### R5 — No information leakage on login failure

"Invalid credentials" — generic. Never "email exists but password wrong" vs. "no such email". Likewise on `/forgot` — always respond "if the address exists, we sent a reset" regardless of existence.

### R6 — RBAC bootstrap

First registered user (or `001_rbac_bootstrap.ts` seed) creates the `super_admin` role with `*.*` and assigns it. Subsequent users default to no role; the super-admin assigns roles via UI.

### R7 — Logout is POST

GET logout is a CSRF hole (link-driven). Use `<form method="POST" action="/logout">` and `+server.ts` handler.

### R8 — Post-auth redirect is server-side

After a successful login / register, `throw redirect(303, …)` from the form action. **Never** return `{ success: true }` from the action and then `goto(...)` (or `window.location`) inside `use:enhance` — `Set-Cookie` from the action response can race the client-side navigation, so the first request after redirect arrives **without** the session cookie and the user bounces back to `/login` (silent loop, no error). Mirror `register/+page.server.ts` — same pattern for login. If you need post-redirect UI state (toast, etc.), encode it in the redirect URL or read it from `locals.user` on the destination, not from action return data.

### R9 — Bounce already-signed-in visitors off `/login` and `/register`

If `locals.user` is set when a visitor hits `/login` or `/register`, redirect them to the dashboard. Otherwise they see a login form for an account they're already in — confusing, and (worse) re-submitting the form rotates the session and can race the existing cookie. Implement in `+page.server.ts` (NOT in the layout — login is in `(public)` and the public layout shouldn't gate auth):

```ts
// src/routes/(public)/login/+page.server.ts
import { redirect } from "bosia";
import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	if (locals.user) throw redirect(303, "/dashboard");
	return {};
}
```

Mirror the same `load` in `(public)/register/+page.server.ts`. The destination is whatever your post-login redirect target is — must match R8's target so the loop is symmetric (login → `/dashboard`, and visiting `/login` while signed in also goes to `/dashboard`).

### R10 — A login page implies a dashboard page

There is no such thing as an app with `/login` but no signed-in destination. The moment you scaffold `(public)/login/+page.svelte`, also scaffold the post-login landing page (typically `(private)/dashboard/+page.svelte`) plus `(private)/+layout.server.ts` that gates the group with `if (!locals.user) throw redirect(303, "/login")`. Don't ship login without dashboard and force the user to ask for it next turn — R8's `redirect(303, "/dashboard")` will 404 and the login flow looks broken.

The dashboard can start minimal (one heading + a Log out form), but it must exist. Reuse the same pattern for any other authenticated landing page (`/app`, `/home`, `/account`) — pick one, scaffold it, redirect there.

## Bosia conventions

- `bosia-routing` — `(public)` group, action-only `/logout` as `+server.ts`.
- `bosia-elysia-routes` — `+server.ts` shape rules.
- `bosia-navigation` — post-submit nav via `redirect(303, …)` in form actions; hard logout uses `window.location.href`.
- `bosia-rbac-permission` — bootstrap with wildcard, no role checks downstream.
- `bosia-drizzle-feature` — additive seeds only.
- `bosia-security-review` — mandatory before finalizing.

## Checklist gate

P0:

- [ ] Argon2id hashing, never SHA-only.
- [ ] Session cookie `HttpOnly; Secure; SameSite=Lax`.
- [ ] Login error message is generic.
- [ ] `/forgot` response identical regardless of email existence.
- [ ] Logout is `POST` via `+server.ts`.
- [ ] Login / register redirect via server-side `throw redirect(303, …)` — never `use:enhance` + client `goto()`.
- [ ] `(public)/login/+page.server.ts` and `(public)/register/+page.server.ts` redirect signed-in visitors to the dashboard (R9).
- [ ] The post-login destination page exists (typically `(private)/dashboard/+page.svelte`) and `(private)/+layout.server.ts` gates the group (R10). Login without a destination is not shippable.
- [ ] All form actions validate input at the boundary.
- [ ] `bosia-security-review` pass.

P1:

- [ ] Rate limit on `/login`, `/register`, `/forgot`.
- [ ] Optional 2FA hook in place.
- [ ] Email verification flow (or marked as deferred).
- [ ] Password rules enforced (min length, common-password block).

## References

- `references/checklist.md` — full auth security checklist.
