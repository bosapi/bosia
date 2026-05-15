---
name: bosia-auth-flow
description: Login + register + logout + forgot-password — Argon2 hash, session cookie, RBAC bootstrap, public route group. Spans multiple files.
triggers:
    - auth
    - login
    - register
    - sign-up
    - sign-in
    - forgot password
    - session
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
| `src/features/auth/password.ts`         | Argon2id hash + verify                                          |
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
3. **Implement `features/auth/password.ts`** — Argon2id via `@node-rs/argon2` or `argon2`. Never SHA-only.
4. **Implement `features/auth/tokens.ts`** — session tokens, opaque random 32 bytes, base64url.
5. **Implement `auth-handle.ts`** — reads `session` cookie, loads user + materialized permissions, sets `locals.user`, `locals.can`.
6. **Routes:** login, register, forgot, logout. Each `+page.server.ts` validates input, returns shape errors via SvelteKit-style `fail()` or a custom return.
7. **RBAC bootstrap on register** — first user becomes super-admin via the bootstrap seed (or assign `*.*` directly if seed already ran).
8. **Run `bosia-security-review`.**

## Rules

### R1 — Password hashing

Argon2id, `memory: 19MiB, time: 2, parallelism: 1` as a baseline. Never plain SHA / unsalted bcrypt.

### R2 — Cookie flags

`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=<session_ttl>`. `Secure` always — local dev should run over `https` or use `__Host-` cookies via the framework helper.

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

## Bosia conventions

- `bosia-routing` — `(public)` group, action-only `/logout` as `+server.ts`.
- `bosia-elysia-routes` — `+server.ts` shape rules.
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
- [ ] All form actions validate input at the boundary.
- [ ] `bosia-security-review` pass.

P1:

- [ ] Rate limit on `/login`, `/register`, `/forgot`.
- [ ] Optional 2FA hook in place.
- [ ] Email verification flow (or marked as deferred).
- [ ] Password rules enforced (min length, common-password block).

## References

- `references/checklist.md` — full auth security checklist.
