---
title: Deployment
description: Build, run, and deploy Bosbun apps in production.
---

## Production Build

```bash
bun run build
```

This produces a `dist/` directory with:

- `dist/server/` — server entry point
- `dist/client/` — client JavaScript and CSS bundles
- `dist/prerendered/` — static HTML for prerendered routes

## Running in Production

```bash
bun run start
```

Or directly:

```bash
bun dist/server/index.js
```

Set the port with the `PORT` environment variable (default: `9000`).

## Health Check

Bosbun exposes a health endpoint at `/_health`:

```bash
curl http://localhost:9000/_health
```

```json
{ "status": "ok", "timestamp": 1711360000000, "timezone": "UTC" }
```

## Prerendering

Mark routes for static prerendering:

```ts
// +page.server.ts
export const prerender = true;
```

Prerendered pages are built as static HTML during `bosbun build` and served from `dist/prerendered/` with a 1-hour cache header.

## Static Asset Caching

Bosbun sets cache headers automatically:

| Asset Type        | Cache Header                          |
| ----------------- | ------------------------------------- |
| Hashed filenames  | `public, max-age=31536000, immutable` |
| Non-hashed files  | `no-cache`                            |

## Graceful Shutdown

The production server handles `SIGTERM` and `SIGINT` signals:

1. Stops accepting new connections
2. Waits for in-flight requests to complete
3. Force exits after 10 seconds if shutdown hangs

## Docker

Example `Dockerfile`:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build
FROM deps AS build
COPY . .
RUN bun run build

# Production
FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
ENV PORT=9000
EXPOSE 9000

CMD ["bun", "dist/server/index.js"]
```

## Environment Variables

See [Environment Variables](/bosbun/guides/environment-variables/) for the full list of configuration options including `PORT`, `BODY_SIZE_LIMIT`, CORS, and CSRF settings.
