# Security review — full checklist

Format: `[ ] item — attack — fix`.

## P0 — must pass

### 1. RBAC on every protected handler

- **Attack:** unauthenticated/under-privileged user calls `POST /api/students/delete` and bypasses UI gating.
- **Fix:** first line of every protected handler is `if (!locals.can('student.delete', scope)) return new Response(null, { status: 403 });`. See `bosia-rbac-permission`.

### 2. No role-equality checks

- **Attack:** a rename of `'admin'` → `'owner'` in seed data silently breaks all `role === 'admin'` checks; the app fails open or closed unpredictably.
- **Fix:** use `can('resource.action')` only.

### 3. Input validated at the boundary

- **Attack:** `POST /api/students { name: { $ne: null } }` injects an unintended type; ORM behavior diverges.
- **Fix:** validate `body` with zod/valibot at the top of the handler; reject on parse fail.

### 4. No secrets in client code

- **Attack:** `API_KEY` imported from `lib/config.ts` ends up in the client bundle; anyone with devtools steals it.
- **Fix:** secrets only in `*.server.ts` modules (Bosia excludes these from the client bundle) or `process.env` accessed inside handlers.

### 5. Path jail on FS operations

- **Attack:** `readFile(`./projects/${userPath}`)` with `userPath = '../../etc/passwd'`.
- **Fix:** `jail(root, userPath)` resolves + checks containment. See the pattern in `SKILL.md`.

### 6. CSRF guard

- **Attack:** attacker hosts `<form action="https://app.example/transfer" method="POST">` on their site; logged-in victim visits, request fires with cookies.
- **Fix:** check `Origin`/`Referer` against `APP_HOST` on every mutating handler, or require a synchronizer token.

### 7. No code injection via `eval` / `Function` / dynamic imports of user paths

- **Attack:** `eval(userInput)` or `new Function(userInput)`.
- **Fix:** never accept code from users. If you need scripting, sandbox in a worker with a fixed API.

## P1 — should pass

### 8. Rate limit auth endpoints

- **Attack:** brute force `/login`.
- **Fix:** per-IP and per-account limiters on `/login`, `/register`, `/forgot-password`.

### 9. Password hashing

- **Attack:** SHA-256 passwords reversed by rainbow table.
- **Fix:** Argon2id (preferred) or bcrypt. Pass through the project's `auth/password` module.

### 10. Cookie flags

- **Attack:** JS-readable session cookies stolen via XSS.
- **Fix:** `HttpOnly; Secure; SameSite=Lax` (or `Strict` for sensitive flows). Path scoped, expiry set.

### 11. SSRF guard on outbound fetch

- **Attack:** user submits `http://169.254.169.254/latest/meta-data/` (AWS metadata) and the server fetches it.
- **Fix:** allow-list hosts; deny RFC1918 + link-local on resolved IP before fetching.

### 12. Error hygiene

- **Attack:** stack trace exposes table names, schema, file paths.
- **Fix:** in production, log full error server-side, return generic `{ error: 'Internal error', id: <correlation> }`.

### 13. Upload validation

- **Attack:** SVG with embedded `<script>` uploaded and served from the app origin.
- **Fix:** content-sniff + extension check; store outside web root; serve via a dedicated handler that sets `Content-Disposition: attachment` and a non-app origin where possible.

### 14. SQL via ORM only

- **Attack:** string-concat SQL with user input.
- **Fix:** all DB access via Drizzle query builder, which parameterizes by default.

### 15. Log hygiene

- **Attack:** passwords and session tokens land in log files / log aggregator.
- **Fix:** redact known sensitive fields before logging; never log full request bodies on auth endpoints.

## Audit grep

```bash
# Role checks (must be empty)
grep -rE "role\s*===|roles\.includes" src/

# Raw FS access without jail (review each hit)
grep -rE "readFile|writeFile|readdir|stat\(" src/

# Secrets in client paths (review)
grep -rE "API_KEY|SECRET|TOKEN" src/lib/ src/routes/ | grep -v "\.server\."

# eval / Function
grep -rE "\beval\(|new Function\(" src/
```
