---
title: Environment Variables
description: Load .env files, use typed imports, and understand the four-tier prefix system.
---

## .env File Loading

Bosia loads environment variables from `.env` files in order (later overrides earlier):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g. `.env.development`, `.env.production`)
4. `.env.[mode].local`

System environment variables always take highest precedence — `.env` files never overwrite existing system vars.

## Prefix System

Variable names control where and when they're available:

| Prefix           | Client | Server | Timing     | Example                  |
| ---------------- | ------ | ------ | ---------- | ------------------------ |
| `PUBLIC_STATIC_` | Yes    | Yes    | Build-time | `PUBLIC_STATIC_APP_NAME` |
| `PUBLIC_`        | Yes    | Yes    | Runtime    | `PUBLIC_API_URL`         |
| `STATIC_`        | No     | Yes    | Build-time | `STATIC_BUILD_ID`        |
| _(no prefix)_    | No     | Yes    | Runtime    | `DATABASE_URL`           |

- **Build-time** variables are inlined during `bosia build` — changing them requires a rebuild
- **Runtime** variables are read from `process.env` on each request
- **Client** variables are safely exposed to the browser; **Server** variables never leave the server

## Accessing Variables

Import from the `$env` virtual module:

```ts
import { PUBLIC_API_URL, DATABASE_URL } from "$env";
```

Only variables declared in your `.env` files are available through this import. The module is type-safe with auto-generated type declarations.

## Framework Variables

These variables are reserved by Bosia and control framework behavior:

| Variable                  | Default                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                    | `9000`                                     | Server port                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `NODE_ENV`                | —                                          | `development` or `production`                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `BODY_SIZE_LIMIT`         | `512K`                                     | Max request body size (supports K, M, G, Infinity)                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `IDLE_TIMEOUT`            | `10`                                       | `Bun.serve` idle timeout in seconds (max `255`). Raise when API routes hold streaming responses with long gaps between chunks — e.g. an AI chat endpoint waiting for a tool call that shells out to `bunx bosia add`. Set to `0` to disable.                                                                                                                                                                                                                                          |
| `MAX_INFLIGHT`            | `Infinity`                                 | Soft cap on concurrent in-flight requests. When set, requests above the cap get a fast `503 Service Unavailable` with `Retry-After: 1` before any work is done — protects single-replica container deploys from OOM under traffic spikes. `/_health` is always exempt so orchestrator liveness probes keep working while the app sheds load. Pick a value below what your container's memory can support per concurrent SSR render (a safe starting point is `500`; tune from there). |
| `CACHE_KEYS`              | `session,sid,auth,token,jwt,Authorization` | Comma-separated cookie/header names that contribute to the response cache identity. Pages with different values for any of these names are cached separately so per-user content never leaks. See [Response cache](/guides/response-cache).                                                                                                                                                                                                                                           |
| `CACHE_MAX_ENTRIES`       | `500`                                      | LRU capacity of the in-memory response cache. Set to `0` to disable the cache entirely. Each entry holds raw + gzip + brotli bytes for one URL/identity pair. See [Response cache](/guides/response-cache).                                                                                                                                                                                                                                                                           |
| `LOAD_TIMEOUT`            | —                                          | Timeout for `load()` in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `METADATA_TIMEOUT`        | —                                          | Timeout for `metadata()` in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `PRERENDER_TIMEOUT`       | —                                          | Timeout for prerender fetch in ms                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `CSRF_ALLOWED_ORIGINS`    | —                                          | Comma-separated allowed origins for CSRF                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `CORS_ALLOWED_ORIGINS`    | —                                          | Comma-separated allowed origins for CORS                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `CORS_ALLOWED_METHODS`    | —                                          | Comma-separated allowed methods                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `CORS_ALLOWED_HEADERS`    | —                                          | Comma-separated allowed headers                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `CORS_EXPOSED_HEADERS`    | —                                          | Comma-separated exposed headers                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `CORS_CREDENTIALS`        | `false`                                    | Set to `"true"` to allow credentials                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `CORS_MAX_AGE`            | `86400`                                    | Preflight cache duration in seconds                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `TRUST_PROXY`             | `false`                                    | Trust `X-Forwarded-Host` / `X-Forwarded-Proto` for CSRF origin checks. Only enable when behind a reverse proxy that strips client-supplied forwarded headers. See [Security › Reverse-proxy deployments](/guides/security/#reverse-proxy-deployments-trust_proxy).                                                                                                                                                                                                                    |
| `DISABLE_X_FRAME_OPTIONS` | `false`                                    | Set to `"true"` to omit the `X-Frame-Options: SAMEORIGIN` header. Use when the app is intentionally embedded as an iframe by a different origin. See [Security › Disabling X-Frame-Options](/guides/security/#disabling-x-frame-options).                                                                                                                                                                                                                                             |
| `BOSIA_OUT_DIR`           | `./dist`                                   | Build output directory (read by `bosia build` + `bosia start`). Use a custom path to run a verification build without colliding with a running `bosia dev` — e.g. `BOSIA_OUT_DIR=.bosia/verify bun run build`. `bosia dev` ignores this and always writes to `.bosia/dev/`.                                                                                                                                                                                                           |

Framework variables are accessed via `process.env` directly, not through `$env`.

## Example .env File

```bash
# Public — available on client and server at runtime
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App

# Public static — inlined at build time
PUBLIC_STATIC_VERSION=1.0.0

# Private — server only
DATABASE_URL=postgres://localhost:5432/mydb
# Also supported (see /guides/database):
#   DATABASE_URL=mysql://user:pass@host:3306/mydb
#   DATABASE_URL=sqlite://./data/app.db
#   DATABASE_URL=sqlite://:memory:     # dev/test only — flushes on restart
API_SECRET=sk_live_abc123

# Framework config
PORT=3000
BODY_SIZE_LIMIT=1M
CORS_ALLOWED_ORIGINS=https://app.example.com
```

## Security

Only `PUBLIC_*` variables declared in `.env` files are sent to the client. Variables set only as system env vars (not in `.env` files) are **never** exposed to the browser, even if they have a `PUBLIC_` prefix.
