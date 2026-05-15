---
name: bosia-security-review
description: Security quality gate — RBAC on every protected handler, input validation at boundaries, no secrets in client, path-jail on FS ops, CSRF via origin guard.
triggers:
    - security review
    - before merge
    - auth changes
    - file system access
od:
    mode: quality-gate
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
    stack: [elysia-routes, svelte-5-runes]
---

# bosia-security-review

## What it does

Audits server-touching code for the failure modes that bite hardest in production: missing authorization, unvalidated input, leaked secrets, FS escape, CSRF, SSRF.

## When to use

Mandatory before finalizing any change that touches auth, RBAC, server handlers, file-system access, external HTTP calls, or shared infrastructure.

## Workflow

1. Walk P0 in `references/checklist.md` against every changed `+server.ts`, `+page.server.ts` action, and FS/network call.
2. For each fail → fix at the boundary (the handler), not in caller code.
3. Re-run.

## P0 — must pass

- [ ] **RBAC on every protected handler.** Loaders, actions, `+server.ts` — all start with `locals.can(...)` (see `bosia-rbac-permission`).
- [ ] **No role-equality checks.** `grep` for `role ===`, `roles.includes` — zero hits.
- [ ] **Input validated at the boundary.** Every `+server.ts` `body`, every form action `formData` — validated before use (zod / valibot / hand guard).
- [ ] **No secrets in client code.** No API keys, DB URLs, signing keys in `+page.svelte`, `lib/components/`, or any code reachable by the client bundle. Server-only modules use `.server.ts` suffix.
- [ ] **Path jail on FS operations.** Every `readFile` / `writeFile` / `readdir` against a user-influenced path is resolved + checked to live inside the allowed root.
- [ ] **CSRF guard.** Mutating handlers (POST/PUT/DELETE/PATCH) check `Origin` / `Referer` against the app origin, or use a CSRF token. Forms submitted from outside the app must fail.
- [ ] **No `eval` / `Function` with user input.** Includes `setTimeout`/`setInterval` with string args.

## P1 — should pass

- [ ] Rate limit on auth endpoints (login, register, password reset).
- [ ] Password hashing via the project's `auth/password` (Argon2/bcrypt), never SHA-only.
- [ ] Session tokens set as `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict` where possible).
- [ ] External HTTP calls (`fetch`) check allow-listed hosts (no SSRF).
- [ ] Errors don't leak stack traces / SQL / file paths to the client.
- [ ] Uploads validated by content type + size at the boundary; stored outside the web root.
- [ ] SQL via Drizzle ORM (parameterized); no string-concat queries.
- [ ] Logs do not contain passwords, tokens, or full request bodies.

## Path-jail pattern

```ts
import { resolve, relative, isAbsolute } from "node:path";

function jail(root: string, userPath: string): string {
	const abs = resolve(root, userPath);
	const rel = relative(root, abs);
	if (rel.startsWith("..") || isAbsolute(rel)) {
		throw new Error("path escape");
	}
	return abs;
}
```

Use this for every FS op whose path is influenced by a request.

## Origin-guard pattern (CSRF)

```ts
function sameOrigin(request: Request): boolean {
	const origin = request.headers.get("Origin") ?? request.headers.get("Referer");
	if (!origin) return false;
	const u = new URL(origin);
	return u.host === process.env.APP_HOST;
}

if (!sameOrigin(request)) return new Response(null, { status: 403 });
```

## References

- `references/checklist.md` — full P0/P1 list, attack examples, fix patterns.
