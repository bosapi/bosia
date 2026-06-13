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

A full auth surface wired to Drizzle + session cookies.

## Files

- `features/auth/password.ts` — Argon2id hash + verify via `Bun.password`
- `features/auth/tokens.ts` — session token mint + verify (opaque random 32 bytes, base64url)
- `features/auth/session-resolver.ts` — resolve session → `locals.user`, `locals.can`
- `features/auth/auth-handle.ts` — hook wiring the resolver into every request
- `(public)/login/+page.{svelte,server.ts}` — form + `actions` (validate, verify, set cookie, redirect)
- `(public)/register/+page.{svelte,server.ts}` — validate, hash, insert user, RBAC bootstrap, redirect
- `(public)/forgot/+page.{svelte,server.ts}` — request reset, mint token, email (or log in dev)
- `logout/+server.ts` — `POST` clears cookie, 303 to `/login` (action-only → `+server.ts`, see bosia-routing R2)

## Workflow

1. Confirm Drizzle `users` table has `passwordHash`; if not, add a numbered seed/migration — never edit applied seeds (bosia-drizzle-feature).
2. Install UI: `bosia add theme/neutral ui/form ui/field ui/input ui/button ui/label ui/alert`.
3. `password.ts` — see R1.
4. `tokens.ts`, `auth-handle.ts` (reads `session` cookie, loads user + materialized permissions, sets `locals.user`/`locals.can`).
5. Routes: login, register, forgot, logout — each `+page.server.ts` validates input and returns field errors via `fail()`.
6. RBAC bootstrap on register (R6). Then run bosia-security-review.

## Rules

R1 — Password hashing: `Bun.password.hash(pw, { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 })` and `Bun.password.verify(pw, hash)`. NEVER `@node-rs/argon2`/`argon2`/`bcrypt` npm packages (NAPI bindings crash under Bun); never plain SHA / unsalted. See [[bosia-bun-runtime]].

R2 — Cookie flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=<ttl>` (first three are defaults). OMIT `secure` in route code — Bosia adds `Secure` per-request only on HTTPS; a literal `secure: true` on HTTP transport triggers a downgrade+warn and a silent login loop. See [[bosia-cookies]].

R3 — Validate at the boundary: form actions parse `formData` and validate (zod/hand), reject with field-level errors, no silent coercion.

R4 — Rate limit `/login`, `/register`, `/forgot` per-IP and per-account (dev bypass only).

R5 — No info leakage: login failure is a generic "Invalid credentials" (never "email exists but wrong password"). `/forgot` always responds "if the address exists, we sent a reset" regardless of existence.

R6 — RBAC bootstrap: first registered user (or `001_rbac_bootstrap.ts` seed) creates `super_admin` with `*.*` and self-assigns. Later users default to no role; super-admin assigns via UI.

R7 — Logout is POST (GET logout is a CSRF hole): `<form method="POST" action="/logout">` + `+server.ts`.

R8 — Post-auth redirect is server-side: `throw redirect(303, …)` from the form action. NEVER return `{ success: true }` then `goto()`/`window.location` inside `use:enhance` — the action's `Set-Cookie` can race the client nav, so the first request lands WITHOUT the session cookie and bounces back to `/login` (silent loop). For post-redirect UI state, encode it in the redirect URL or read `locals.user` at the destination.

R9 — Bounce signed-in visitors off `/login` and `/register`. In `+page.server.ts` (NOT the layout — login is `(public)`):

```ts
// src/routes/(public)/login/+page.server.ts
import { redirect, type LoadEvent } from "bosia";
export async function load({ locals }: LoadEvent) {
	if (locals.user) throw redirect(303, "/dashboard");
	return {};
}
```

Mirror in `(public)/register/+page.server.ts`. Target must match R8's so the loop is symmetric.

R10 — A login page implies a dashboard page. When you scaffold `(public)/login/+page.svelte`, also scaffold the post-login landing (typically `(private)/dashboard/+page.svelte`) plus `(private)/+layout.server.ts` gating the group (`if (!locals.user) throw redirect(303, "/login")`). Otherwise R8's redirect 404s and login looks broken. The dashboard can start minimal (heading + Log out form) but must exist.

## Checklist gate

P0:

- [ ] Argon2id hashing, never SHA-only.
- [ ] Session cookie `HttpOnly; SameSite=Lax` (Secure added per-request, not literal).
- [ ] Generic login error; `/forgot` response identical regardless of email existence.
- [ ] Logout is `POST` via `+server.ts`.
- [ ] Login/register redirect via server-side `throw redirect(303, …)` — never `use:enhance` + client `goto()`.
- [ ] `(public)/login` and `(public)/register` `+page.server.ts` redirect signed-in visitors to the dashboard (R9).
- [ ] Post-login destination exists + `(private)/+layout.server.ts` gates the group (R10).
- [ ] All form actions validate input at the boundary.
- [ ] bosia-security-review pass.

P1:

- [ ] Rate limit on `/login`, `/register`, `/forgot`.
- [ ] Optional 2FA hook; email verification (or marked deferred).
- [ ] Password rules enforced (min length, common-password block).

Related: bosia-routing, bosia-elysia-routes, bosia-navigation, bosia-rbac-permission, bosia-drizzle-feature, bosia-security-review. Reference: `references/checklist.md`.
