---
title: Deployment
description: Build, run, and deploy Bosia apps in production.
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

Bosia exposes a health endpoint at `/_health`:

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

Prerendered pages are built as static HTML during `bosia build` and served from `dist/prerendered/` with a 1-hour cache header.

Data payloads for client-side navigation are also prerendered as JSON files at `dist/prerendered/__bosia/data/<route>.json`. This means client navigation works on fully static sites (GitHub Pages, Netlify, etc.) without a running server.

## Static Asset Caching

Bosia sets cache headers automatically:

| Asset Type       | Cache Header                          |
| ---------------- | ------------------------------------- |
| Hashed filenames | `public, max-age=31536000, immutable` |
| Non-hashed files | `no-cache`                            |

## Behind a Reverse Proxy

When Bosia runs behind nginx, Caddy, Cloudflare, an ALB, or any other reverse proxy / load balancer, the public-facing host typically differs from the `Host` header reaching the inner Bun process. Set:

```bash
TRUST_PROXY=true
```

so that CSRF origin checks honour `X-Forwarded-Host` and `X-Forwarded-Proto` and accept requests whose `Origin` matches the public-facing URL.

**Only enable `TRUST_PROXY=true` when:**

- A proxy or load balancer sits in front of Bosia, and
- That proxy strips any **client-supplied** `X-Forwarded-*` headers before forwarding (verify your proxy's behaviour), and
- The proxy injects its own `X-Forwarded-Host` / `X-Forwarded-Proto` reflecting the public origin.

**Do not** set `TRUST_PROXY=true` when:

- Bosia is directly internet-facing with no proxy, or
- You cannot confirm the proxy sanitises inbound `X-Forwarded-*` headers — that would let any client spoof its own origin and bypass CSRF.

See [Security › Reverse-proxy deployments](/guides/security/#reverse-proxy-deployments-trust_proxy) for the full rationale.

## Graceful Shutdown

The production server handles `SIGTERM` and `SIGINT` signals:

1. Stops accepting new connections
2. Waits for in-flight requests to complete
3. Force exits after 10 seconds if shutdown hangs

## Docker

Example `Dockerfile`:

```bash
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

See [Environment Variables](/guides/environment-variables/) for the full list of configuration options including `PORT`, `BODY_SIZE_LIMIT`, CORS, and CSRF settings.
