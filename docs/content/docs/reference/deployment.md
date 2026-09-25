---
title: Deployment
description: Build, run, and deploy Bosia apps in production — on Bun or Cloudflare Workers.
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

## Mounting Under a Sub-Path

To serve an app from `example.com/sso` rather than the origin root — several apps sharing one hostname, or no subdomain available — set:

```bash
BASE_PATH=/sso
```

nginx then passes the path through **unchanged**. No stripping, no `proxy_redirect`, no `sub_filter`:

```nginx
location /sso {
    proxy_pass http://127.0.0.1:9000;
    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Host  $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
}
```

Note the `location /sso` without a trailing slash. `location /sso/` would not match a bare `example.com/sso`, which Bosia serves as the app's root page.

Bosia strips the prefix once, at the edge of the request, so everything downstream works in "app space" — hooks, `load()`, actions and `event.url.pathname` never see the prefix, and routes are written exactly as they are at the root. On the way out it puts the prefix back on: redirects, trailing-slash canonicalization, framework asset URLs, the client router's history entries and its data fetches. Cookies default to the mount as their path, so a neighbouring app on the same origin never receives them.

Requests outside the base get a 404 — including the health check, which moves to `/sso/_health`. Update your load balancer, Docker `HEALTHCHECK` or Kubernetes probe to match.

### What it does not cover

**URLs your components build.** Bosia rebases the URLs in its server-rendered HTML, but the client re-renders on mount and a component writes its own path straight back. Anything a component constructs needs the `base` export:

```svelte
<script>
	import { base } from "bosia";
</script>

<img src="{base}/logo.png" alt="" />
<span style="mask-image:url('{base}/icons/check.svg')"></span>
```

This is easy to miss because it fails quietly — a mask that 404s is a blank square, not an error.

Static markup is handled for you: a literal `<a href="/masuk">` in a `.svelte` file is rewritten at compile time, so the href in the DOM is the real URL. Nothing is rewritten after a click — the route table is generated with the prefix, so a click pushes exactly the URL that was in the link. That also means `goto()` takes a real path:

```ts
goto(`${base}/beranda`); // not goto("/beranda")
```

`redirect()` does **not** need it, in `load()` or in an action — it is rebased for you:

```ts
throw redirect(303, "/masuk"); // → /sso/masuk on the wire
```

Neither does `event.url.pathname`, which is already app space by the time you read it. Reach for `base` only when you are assembling an absolute URL by hand, e.g. `${url.origin}${base}/reset?t=...` for a link that leaves the app.

**Build and runtime must agree.** The compiled CSS, the client route table and the markup in your `.svelte` files are all rebased at build time, so `BASE_PATH` has to be set for `bosia build` as well as `bosia start`. The build stamps the value into `dist/manifest.json` and the server warns on start if it disagrees:

```
⚠️  Built for BASE_PATH="/sso" but running with "" — CSS urls and the client route table are baked in and will not match.
```

Take that warning seriously: the mismatch itself is quiet — a missing font, a blank icon, or links that leave the app. If `BASE_PATH` lives in `.env.production`, note that only `bosia build` and `bosia start` load it; a bare `bun run` of the server does not.

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

## Cloudflare Workers

Bosia can also build for [Cloudflare Workers](https://developers.cloudflare.com/workers/), including the free tier. Pick the target on the command line:

```bash
bosia build --target=workers
```

or once, in `bosia.config.ts`:

```ts
import { defineConfig } from "bosia";

export default defineConfig({ target: "workers" });
```

On top of the usual `dist/`, a Workers build writes:

- `dist/worker/index.js` — the worker. Static files and prerendered pages in `dist/static/` are served by Cloudflare before it runs.
- `wrangler.jsonc` — only when you don't have one yet. It's yours from then on: add bindings (D1, KV, R2) and `vars` there. A rebuild never overwrites it.

Try it locally with `bosia start` — for a Workers build it runs `wrangler dev` (Wrangler is fetched on first use). Deploy with:

```bash
bunx wrangler deploy
```

### Bindings — `event.platform.env`

Cloudflare hands bindings to the worker, not to a global. Bosia passes them to your server code as `event.platform.env` — in hooks, `+server.ts`, `load()` and `metadata()`:

```ts
// src/routes/posts/+page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ platform }: LoadEvent) {
	const { results } = await platform!.env.DB.prepare("SELECT * FROM posts").all();
	return { posts: results };
}
```

`platform` is `undefined` when the same app runs on Bun. To type your bindings, run `bunx wrangler types` and extend Bosia's `PlatformEnv` with the generated `Env`:

```ts
// src/platform.d.ts — its own file: the `export {}` makes this extend "bosia" instead of replacing it
export {};

declare module "bosia" {
	interface PlatformEnv extends Env {}
}
```

### Environment variables

`.env` files are not deployed. Runtime values come from Cloudflare instead: `vars` in `wrangler.jsonc`, `wrangler secret put` for secrets, and a `.dev.vars` file for local `wrangler dev`. They reach `$env` and `process.env` as usual. Names still come from your `.env*` files, and `STATIC_*` / `PUBLIC_STATIC_*` are still baked in at build time.

Framework variables work the same (`BODY_SIZE_LIMIT`, `CSRF_*`, `CORS_*`, `CACHE_*`). The ones about running a process — `PORT`, `IDLE_TIMEOUT`, `BOSIA_REUSE_PORT` — do nothing on Workers.

### Bun-only code

A worker has no `Bun` global and no filesystem. The build stops early if your server code — routes, `hooks.server.ts` and `src/lib/server/` — uses `Bun.*` or imports `fs`, `bun` or `bun:*`, and prints each file and line. Swap in Web APIs (`fetch`, `crypto.subtle`) or bindings (D1 instead of `bun:sqlite`, R2 instead of `Bun.s3`). `node:crypto`, `node:zlib` and friends work through Cloudflare's Node compatibility.

A `typeof Bun` check on the same line is allowed, so code shared between targets can branch. The check reads files by path, so a `Bun` call in a plain `src/lib/*.ts` helper slips past it — and fails at request time instead. Set `BOSIA_WORKERS_GUARD=0` to turn the error into a warning.

### Prerender pages that don't change

A prerendered page is a plain file that Cloudflare serves before the worker runs. It uses no CPU time and doesn't count as a worker request, which matters on the free tier (100,000 requests a day). Landing, pricing and docs pages are good fits:

```ts
// src/routes/pricing/+page.server.ts
export const prerender = true;
```

Its loader runs once, at build time, so skip it for pages that depend on who is visiting (cookies, the logged-in user), read `event.platform.env` bindings, or export form `actions` — the build keeps those pages live.

### Limits

- **Response cache is per isolate.** It still helps on busy routes, but Cloudflare runs many isolates and evicts them freely, so `invalidate()` only clears the copy in the isolate that ran it. Keep cached pages short-lived, or opt routes out with `export const cache = false`.
- **Bundle size.** The free tier allows 3 MB gzipped. The demo app is about 410 KB; plugins imported by `bosia.config.ts` are bundled even when they only act in dev.
- **No graceful shutdown** — Cloudflare manages the lifecycle. `/_health` still answers.
- **Startup warm-up.** Each new isolate renders `/` once, without hooks, loaders or the cache, so the first real request doesn't pay to compile the render path. Code at the top of `/`'s components runs one extra time per isolate.
- **Compression** is done by Cloudflare, not Bosia, so it doesn't count against your CPU time.

## Sandboxed / Multi-Tenant Hosting

If you run Bosia apps inside a hardened sandbox that blocks native (`.node`) addons — e.g. a multi-tenant host scanning each app's `node_modules` — be aware that the Bosia toolchain ships native binaries it needs to **build and run** an app:

| Package              | Used by                                 |
| -------------------- | --------------------------------------- |
| `@tailwindcss/oxide` | Tailwind v4 CSS engine (build)          |
| `lightningcss`       | CSS transform/minify (build)            |
| `@parcel/watcher`    | File watching in `bosia dev` (dev mode) |

These are framework build-tooling — pure compute / inotify — and do **not** need the kernel-modifying syscalls such a sandbox usually denies (a `SystemCallFilter=@system-service` systemd unit permits them). If your host blanket-rejects `.node` files, **allowlist these packages** (and their per-platform sub-packages such as `lightningcss-linux-x64-musl`) rather than the app's own code. Match the package directory name with an anchored platform suffix so a lookalike like `lightningcss-evil` can't slip through.

## Environment Variables

See [Environment Variables](/guides/environment-variables/) for the full list of configuration options including `PORT`, `BODY_SIZE_LIMIT`, CORS, and CSRF settings.
