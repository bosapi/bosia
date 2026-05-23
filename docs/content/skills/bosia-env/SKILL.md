---
name: bosia-env
description: Env var conventions — four-tier prefix system (`PUBLIC_STATIC_` / `PUBLIC_` / `STATIC_` / none), `$env` virtual module for user vars, `process.env` for framework-reserved vars, `.env` load order.
triggers:
    - env variable
    - .env
    - PUBLIC_
    - DATABASE_URL
    - framework env
    - environment variable
    - process.env
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

# bosia-env

## What it covers

Where env vars live, which prefix to pick, and how to read them. Two reading channels:

- `$env` virtual module — user-declared vars from `.env` files.
- `process.env` — framework-reserved vars (`PORT`, `CORS_*`, `CSRF_*`, `TRUST_PROXY`, …).

## When to use

- Adding any new `.env` key.
- Reading config from a `+server.ts`, `+page.server.ts`, hook, or library module.
- Exposing config to the browser.
- Wiring CORS / CSRF / proxy / timeouts (see [[bosia-cors]] for the CORS-specific recipe).

## Rules

### R1 — Pick the prefix by visibility × timing

| Prefix           | Client | Server | Timing     | Example                  |
| ---------------- | ------ | ------ | ---------- | ------------------------ |
| `PUBLIC_STATIC_` | yes    | yes    | build-time | `PUBLIC_STATIC_APP_NAME` |
| `PUBLIC_`        | yes    | yes    | runtime    | `PUBLIC_API_URL`         |
| `STATIC_`        | no     | yes    | build-time | `STATIC_BUILD_ID`        |
| _(no prefix)_    | no     | yes    | runtime    | `DATABASE_URL`           |

- Secret → never `PUBLIC_*`.
- Changes between deploys without a rebuild → runtime, not `STATIC_`.
- Changing a `STATIC_` / `PUBLIC_STATIC_` value requires `bosia build` again.

### R2 — Read user vars via `$env`

```ts
import { PUBLIC_API_URL, DATABASE_URL } from "$env";
```

Only keys declared in a `.env*` file are importable — types are codegen'd. A typo throws at type-check, not at runtime.

Never `process.env.PUBLIC_API_URL` for user vars. The `$env` module is the contract that enforces "declared in a file we ship" — vars set only in system env (CI, shell) are not auto-exposed to the client, which is the security guarantee.

### R3 — Read framework vars via `process.env`

These are reserved by Bosia and live outside `$env`:

| Var                       | Default    | Purpose                                                      |
| ------------------------- | ---------- | ------------------------------------------------------------ |
| `PORT`                    | `9000`     | Server port                                                  |
| `NODE_ENV`                | —          | `development` / `production`                                 |
| `BODY_SIZE_LIMIT`         | `512K`     | Max request body. `K`/`M`/`G`/`Infinity`                     |
| `IDLE_TIMEOUT`            | `10`       | `Bun.serve` idle seconds. Raise for streaming                |
| `MAX_INFLIGHT`            | `Infinity` | Soft concurrency cap → fast `503` over the line              |
| `LOAD_TIMEOUT`            | —          | `load()` timeout in ms                                       |
| `METADATA_TIMEOUT`        | —          | `metadata()` timeout                                         |
| `PRERENDER_TIMEOUT`       | —          | Prerender fetch timeout                                      |
| `CSRF_ALLOWED_ORIGINS`    | —          | Extra origins allowed on POST/PUT/PATCH/DELETE               |
| `TRUST_PROXY`             | `false`    | Trust `X-Forwarded-Host` / `-Proto` for the CSRF origin calc |
| `CORS_ALLOWED_ORIGINS`    | —          | Enable CORS; see [[bosia-cors]]                              |
| `CORS_ALLOWED_METHODS`    | —          | Override allowed methods                                     |
| `CORS_ALLOWED_HEADERS`    | —          | Override allowed headers                                     |
| `CORS_EXPOSED_HEADERS`    | —          | Browser-visible response headers                             |
| `CORS_CREDENTIALS`        | `false`    | `"true"` enables cookie/credential mode                      |
| `CORS_MAX_AGE`            | `86400`    | Preflight cache seconds                                      |
| `DISABLE_X_FRAME_OPTIONS` | `false`    | Drop `X-Frame-Options` (intentional iframe embeds)           |
| `CSP_DIRECTIVES`          | —          | Opt-in CSP; `{nonce}` placeholder substituted per-request    |
| `BOSIA_OUT_DIR`           | `./dist`   | Build output directory                                       |

```ts
const port = Number(process.env.PORT ?? 9000);
```

Framework vars are **not** importable from `$env` — `$env` is for user app config only.

### R4 — Load order (later wins)

1. `.env`
2. `.env.local`
3. `.env.[mode]`
4. `.env.[mode].local`

System env (`process.env` at boot) beats all `.env*` files — `.env` never overwrites a key already in the process environment.

### R5 — `.env.example` is the contract

Every key the app reads must appear in `.env.example` with a placeholder. New contributors copy it to `.env.local`. No undocumented keys.

```bash
# .env.example
DATABASE_URL=postgres://localhost:5432/myapp
PUBLIC_API_URL=https://api.example.com
# CORS_ALLOWED_ORIGINS=https://admin.example.com
```

### R6 — Reading on the client

`PUBLIC_*` (runtime) reads through `$env` work on both sides. `PUBLIC_STATIC_*` are inlined into the build — changing them requires `bosia build` again.

Don't gate client behavior on a private var "through" SSR — pass it as page data from a `load()` instead.

## Workflow

1. Decide visibility (does the browser need it?) and timing (does it change without a rebuild?).
2. Pick the prefix from R1.
3. Add the key to `.env.example` with a placeholder + a one-line comment.
4. Add the real value to `.env.local` (gitignored) or the deploy env.
5. If user var → `import { … } from "$env"`. If framework var → `process.env.…`.

## Anti-patterns

- `PUBLIC_DATABASE_URL` — secret with a public prefix; will ship to the browser.
- `process.env.MY_API_KEY` in a `+page.svelte` — the bundle inlines it (or leaves a hole); use `$env` server-side and pass via `load()`.
- Committing `.env.local` or any file containing real secrets.
- Reading `CORS_ALLOWED_ORIGINS` from `$env` — it's framework-reserved; the codegen won't include it.
- Editing `.env` to flip a `STATIC_*` value and expecting a hot-reload — rebuild required.

## Checklist gate

P0:

- [ ] Every read key is declared in `.env.example`.
- [ ] No secrets behind a `PUBLIC_*` prefix.
- [ ] User vars via `$env`; framework vars via `process.env`.
- [ ] `.env.local` is gitignored.

P1:

- [ ] `STATIC_` / `PUBLIC_STATIC_` only used when a rebuild on change is acceptable.
- [ ] `PUBLIC_STATIC_` carries nothing the deployer would want to flip without a build.
- [ ] Framework var defaults documented in `.env.example` comments where non-obvious.

## Cross-references

- [[bosia-cors]] — CORS recipe + how to tell CSRF errors apart from CORS errors.
- [[bosia-security-review]] — checks no secrets leak to the client bundle.
- [[bosia-elysia-routes]] — handlers reading env at request time.
