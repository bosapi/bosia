---
title: Environment Variables
description: Load .env files, use typed imports, and understand the four-tier prefix system.
---

## .env File Loading

Bosbun loads environment variables from `.env` files in order (later overrides earlier):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g. `.env.development`, `.env.production`)
4. `.env.[mode].local`

System environment variables always take highest precedence — `.env` files never overwrite existing system vars.

## Prefix System

Variable names control where and when they're available:

| Prefix            | Client | Server | Timing     | Example                    |
| ----------------- | ------ | ------ | ---------- | -------------------------- |
| `PUBLIC_STATIC_`  | Yes    | Yes    | Build-time | `PUBLIC_STATIC_APP_NAME`   |
| `PUBLIC_`         | Yes    | Yes    | Runtime    | `PUBLIC_API_URL`           |
| `STATIC_`         | No     | Yes    | Build-time | `STATIC_BUILD_ID`          |
| *(no prefix)*     | No     | Yes    | Runtime    | `DATABASE_URL`             |

- **Build-time** variables are inlined during `bosbun build` — changing them requires a rebuild
- **Runtime** variables are read from `process.env` on each request
- **Client** variables are safely exposed to the browser; **Server** variables never leave the server

## Accessing Variables

Import from the `$env` virtual module:

```ts
import { PUBLIC_API_URL, DATABASE_URL } from "$env";
```

Only variables declared in your `.env` files are available through this import. The module is type-safe with auto-generated type declarations.

## Framework Variables

These variables are reserved by Bosbun and control framework behavior:

| Variable                | Default   | Description                                      |
| ----------------------- | --------- | ------------------------------------------------ |
| `PORT`                  | `9000`    | Server port                                      |
| `NODE_ENV`              | —         | `development` or `production`                    |
| `BODY_SIZE_LIMIT`       | `512K`    | Max request body size (supports K, M, G, Infinity) |
| `LOAD_TIMEOUT`          | —         | Timeout for `load()` in ms                       |
| `METADATA_TIMEOUT`      | —         | Timeout for `metadata()` in ms                   |
| `PRERENDER_TIMEOUT`     | —         | Timeout for prerender fetch in ms                |
| `CSRF_ALLOWED_ORIGINS`  | —         | Comma-separated allowed origins for CSRF         |
| `CORS_ALLOWED_ORIGINS`  | —         | Comma-separated allowed origins for CORS         |
| `CORS_ALLOWED_METHODS`  | —         | Comma-separated allowed methods                  |
| `CORS_ALLOWED_HEADERS`  | —         | Comma-separated allowed headers                  |
| `CORS_EXPOSED_HEADERS`  | —         | Comma-separated exposed headers                  |
| `CORS_CREDENTIALS`      | `false`   | Set to `"true"` to allow credentials             |
| `CORS_MAX_AGE`          | `86400`   | Preflight cache duration in seconds              |

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
API_SECRET=sk_live_abc123

# Framework config
PORT=3000
BODY_SIZE_LIMIT=1M
CORS_ALLOWED_ORIGINS=https://app.example.com
```

## Security

Only `PUBLIC_*` variables declared in `.env` files are sent to the client. Variables set only as system env vars (not in `.env` files) are **never** exposed to the browser, even if they have a `PUBLIC_` prefix.
