---
name: bosia-cors
description: CORS recipe — when to enable, env vars (`CORS_ALLOWED_ORIGINS` + friends), preflight rules, credentials mode, and how to tell a real CORS failure apart from a CSRF rejection that looks like one.
triggers:
    - cors
    - cross-origin
    - access-control-allow-origin
    - preflight
    - "Cross-origin request blocked"
    - iframe preview
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
    stack: [elysia-routes]
---

# bosia-cors

## What it does

Configures cross-origin access for a Bosia server and triages "cross-origin"-looking errors. CORS is **disabled by default**; enable only when a different-origin browser caller needs to read your responses.

## When to use

- A separate-origin SPA / mobile webview / browser extension calls your API.
- An embedder iframe on origin **B** runs `fetch()` against your server on origin **A**.
- You see a real CORS failure in browser devtools (see Diagnosis below).
- You're scaffolding a Bosapi-spawned app served through a preview proxy (e.g. `a-<uuid>.lvh.me:9000`).

## Diagnosis first — CORS vs CSRF

Bosia's CSRF check emits a message that **looks like** a CORS error but isn't. Get this right before changing env.

| Symptom                                                                                             | Layer   | Fix                                                                           |
| --------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| Response body / network tab: `403` with `Cross-origin request blocked: Origin "..." is not allowed` | Server  | CSRF — set `CSRF_ALLOWED_ORIGINS=<that exact origin>` (or `TRUST_PROXY=true`) |
| Browser console: `…has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header…`       | Browser | CORS — set `CORS_ALLOWED_ORIGINS`                                             |
| Browser console: `…request does not pass access control check: It does not have HTTP ok status`     | Browser | CORS preflight rejected — fix methods/headers allow-list                      |
| `OPTIONS` returns `403 Method X not allowed by CORS policy`                                         | Server  | Add the verb to `CORS_ALLOWED_METHODS`                                        |

**Tell**: the CSRF error arrives **as the response body** of the original request. The browser never blocks it client-side. A real CORS error means the browser refused to expose / send the request — the server response (if any) is invisible to JS.

For the iframe-preview pattern (`a-<uuid>.lvh.me:9000` → proxy → `localhost:port`) the typical fix is `CSRF_ALLOWED_ORIGINS` listing the preview origin — **not** CORS. See [[bosia-env]] for the framework vars and Workflow B below.

## Rules

### R1 — Enable CORS by setting at least one origin

```bash
CORS_ALLOWED_ORIGINS=https://app.example.com, https://admin.example.com
```

Empty / unset = CORS off (no headers emitted). Wildcards are not supported — list each origin explicitly. Include the scheme and port (`http://lvh.me:9000`, not `lvh.me`).

### R2 — Tighten methods and headers as needed

```bash
CORS_ALLOWED_METHODS=GET, POST, PUT, DELETE
CORS_ALLOWED_HEADERS=Content-Type, Authorization
```

Defaults: `GET, HEAD, PUT, PATCH, POST, DELETE` / `Content-Type, Authorization`. Preflight (`OPTIONS`) validates `Access-Control-Request-Method` and `Access-Control-Request-Headers` against these lists and rejects with `403 + reason` if either falls outside.

### R3 — Expose response headers explicitly

```bash
CORS_EXPOSED_HEADERS=X-Request-Id, X-Total-Count
```

The browser hides every non-CORS-safelisted response header from JS unless it's named here. The defaults expose none.

### R4 — Credentials mode is opt-in

```bash
CORS_CREDENTIALS=true
```

Set only when the caller needs to send cookies or `Authorization`. With credentials on, the browser additionally requires the response origin to match the request origin exactly — wildcards would be rejected anyway.

### R5 — Preflight cache

```bash
CORS_MAX_AGE=86400   # seconds; default 24h
```

Lower this only when you're churning the allow-list during a rollout.

### R6 — `Vary: Origin` is always set

When CORS is enabled, every response — including those from non-allowed origins — carries `Vary: Origin`. Don't strip it at a CDN; doing so lets a cache serve `Access-Control-Allow-Origin: A` to a request from origin `B`.

## Workflows

### A — Standalone API consumed by a separate-origin browser app

1. List every origin the browser app runs on (`https://app.example.com`, dev `http://localhost:5173`).
2. `.env`: `CORS_ALLOWED_ORIGINS=…`.
3. If the API needs cookies / `Authorization`: add `CORS_CREDENTIALS=true` and ensure the browser app uses `fetch(url, { credentials: "include" })`.
4. If non-default verbs or custom headers: set `CORS_ALLOWED_METHODS` / `CORS_ALLOWED_HEADERS`.
5. Add the same keys to `.env.example` (see [[bosia-env]]).

### B — Bosapi-spawned preview app reached via `a-<uuid>.lvh.me:9000`

The iframe and the inner app share the **same** origin in the browser's eyes (the proxy serves both under `lvh.me:9000`), so CORS is usually not the right tool. The errors come from CSRF — the inner app boots on `localhost:<port>`, so its "expected origin" doesn't match the `lvh.me` origin the browser sends.

**Primary fix — allow-list the preview origin in the child `.env`:**

```bash
# bosapi/data/users/<userId>/<projectSlug>/<appSlug>/.env
CSRF_ALLOWED_ORIGINS=http://lvh.me:9000,http://a-<uuid>.lvh.me:9000
```

List both the bare `lvh.me:9000` (for cross-app navigation) and the per-app subdomain. Bosapi should write this when it scaffolds a new app.

**Alternative — `TRUST_PROXY=true`** makes the CSRF check honor the `X-Forwarded-Host` header the bosapi proxy already sets. Works, but trusts forwarded headers globally for the inner app — prefer `CSRF_ALLOWED_ORIGINS` unless you also need the forwarded host/proto reflected elsewhere.

1. Diagnose the layer (see table above). `403` HTML body with `Cross-origin request blocked` → CSRF.
2. Add the exact `a-<uuid>.lvh.me:9000` origin (plus `lvh.me:9000`) to `CSRF_ALLOWED_ORIGINS`.
3. Restart the child app. Re-load the iframe.
4. If a different host actually does call the inner app cross-origin (rare), add that origin to **both** `CORS_ALLOWED_ORIGINS` and `CSRF_ALLOWED_ORIGINS`.

### C — Mobile / native client (no browser → no CORS)

Native HTTP clients don't enforce CORS. Don't open `CORS_ALLOWED_ORIGINS` for them. Use auth + `CSRF_ALLOWED_ORIGINS` (if the client sends an `Origin` header) instead.

## Example .env

```bash
# CORS — only the origins that actually need cross-origin browser access
CORS_ALLOWED_ORIGINS=https://app.example.com, https://admin.example.com
CORS_ALLOWED_METHODS=GET, POST, PUT, PATCH, DELETE
CORS_ALLOWED_HEADERS=Content-Type, Authorization
CORS_EXPOSED_HEADERS=X-Request-Id
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# Bosapi preview proxy — allow-list the lvh.me host(s) the iframe loads:
CSRF_ALLOWED_ORIGINS=http://lvh.me:9000,http://a-<uuid>.lvh.me:9000

# OR, behind a reverse proxy / preview proxy (trusts forwarded headers globally):
# TRUST_PROXY=true
```

## Anti-patterns

- Setting `CORS_ALLOWED_ORIGINS=*` (not supported — pick real origins).
- Treating a server `403 Cross-origin request blocked` as a CORS bug — it's CSRF; CORS env won't fix it.
- Adding `CORS_ALLOWED_ORIGINS` to silence a same-origin iframe-preview error — list the preview origin in `CSRF_ALLOWED_ORIGINS` instead.
- Enabling `CORS_CREDENTIALS=true` without auditing what cookies cross — every same-origin session cookie now flies to the listed origins.
- Trusting the network tab "OPTIONS 204" as proof CORS is right — the real GET/POST that follows might still fail if `Access-Control-Expose-Headers` omits what your code reads.
- Hand-rolling CORS headers in a `+server.ts`. The framework already runs the policy from env on every response; double-writing the header trips `Vary` invariants.

## Checklist gate

P0:

- [ ] Diagnosed CORS vs CSRF before touching env (see Diagnosis table).
- [ ] `CORS_ALLOWED_ORIGINS` lists exact origins (scheme + host + port). No wildcards.
- [ ] No secrets exposed because `CORS_CREDENTIALS=true` is now on.
- [ ] Preview-proxy app lists the preview origin(s) in `CSRF_ALLOWED_ORIGINS` rather than opening CORS.

P1:

- [ ] `CORS_ALLOWED_METHODS` / `CORS_ALLOWED_HEADERS` tightened to what the client actually uses.
- [ ] `CORS_EXPOSED_HEADERS` lists every non-safelisted response header the client reads.
- [ ] `.env.example` documents which CORS keys exist (commented placeholders).
- [ ] `Vary: Origin` not stripped at the CDN / reverse proxy.

## Cross-references

- [[bosia-env]] — prefix system and the full framework-var table (`CORS_*`, `CSRF_*`, `TRUST_PROXY`).
- [[bosia-security-review]] — CSRF origin guard and credential exposure checks.
- [[bosia-elysia-routes]] — handler shape; do not hand-roll CORS headers in routes.
