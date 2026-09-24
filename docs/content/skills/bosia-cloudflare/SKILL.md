---
name: bosia-cloudflare
description: 'Deploying a Bosia app to Cloudflare Workers — `target: "workers"`, `wrangler.jsonc`, bindings via `event.platform.env`, runtime vars from Cloudflare (not `.env`), the Bun-only-code build guard, and the per-isolate response cache.'
triggers:
  - cloudflare
  - workers
  - wrangler
  - deploy to cloudflare
  - D1
  - KV
  - R2
  - platform.env
  - edge deploy
od:
  mode: convention
  category: runtime
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

# bosia-cloudflare

## What it covers

Building and deploying a Bosia app to Cloudflare Workers, and writing server code that runs there. Default target is Bun — this skill applies only when the app targets Workers.

## When to use

- The user asks to deploy to Cloudflare / Workers, or the app has `target: "workers"` in `bosia.config.ts` or a `wrangler.jsonc`.
- Reading a D1 / KV / R2 binding or a Cloudflare secret.
- A Workers build fails with `Workers guard: server code uses APIs Cloudflare Workers doesn't have`.

## Rules

### R1 — Pick the target once, in config

```ts
// bosia.config.ts
import { defineConfig } from "bosia";

export default defineConfig({ target: "workers" });
```

`bosia build --target=workers` does the same for one build and beats the config. The build writes `dist/worker/index.js` and, only if missing, `wrangler.jsonc`. Local run: `bosia start` (runs `wrangler dev`). Deploy: `bunx wrangler deploy`. Never add `wrangler` to `packages/bosia`; `bunx` fetches it.

### R2 — `wrangler.jsonc` is the user's file

Bindings (`d1_databases`, `kv_namespaces`, `r2_buckets`) and `vars` go there. Bosia never overwrites it — edit it, don't delete it to "regenerate". Keep `main`, `assets.directory` and `compatibility_flags: ["nodejs_compat"]` as generated.

### R3 — Bindings come from `event.platform.env`

```ts
// src/routes/posts/+page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ platform }: LoadEvent) {
	const { results } = await platform!.env.DB.prepare("SELECT * FROM posts").all();
	return { posts: results };
}
```

Available in hooks, `+server.ts`, `load()`, `metadata()`. `platform` is `undefined` on Bun. Type bindings with `bunx wrangler types` plus a **module** `.d.ts` (the `export {}` is required — without it the file replaces `"bosia"` instead of extending it):

```ts
// src/platform.d.ts
export {};

declare module "bosia" {
	interface PlatformEnv extends Env {}
}
```

### R4 — Runtime vars come from Cloudflare, not `.env`

`.env` files are not deployed. Values: `vars` in `wrangler.jsonc`, `bunx wrangler secret put NAME` for secrets, `.dev.vars` for local `wrangler dev` (gitignored). They still read through `$env` / `process.env`; names still come from `.env*` files (see [[bosia-env]]). `PORT`, `IDLE_TIMEOUT`, `BOSIA_REUSE_PORT` do nothing on Workers.

### R5 — No Bun APIs, no filesystem in server code

The build fails on `Bun.*`, and imports of `fs` / `node:fs` / `bun` / `bun:*` in routes' server files, `hooks.server.ts` and `src/lib/server/**`. Substitutions:

| Bun (see [[bosia-bun-runtime]]) | Workers                                           |
| ------------------------------- | ------------------------------------------------- |
| `bun:sqlite`, `Bun.SQL`         | D1 binding (or Hyperdrive for Postgres)           |
| `Bun.s3`                        | R2 binding                                        |
| `Bun.password`                  | `crypto.subtle` (PBKDF2) — no argon2 without WASM |
| `Bun.file` / `fs` reads         | `import` the data, an R2/KV binding, or `fetch`   |
| `Bun.spawn`                     | Not available                                     |
| `node:crypto`, `node:zlib`      | Work as-is (`nodejs_compat`)                      |

Code shared by both targets may branch on `typeof Bun !== "undefined"` **on the same line** as the `Bun.` use. The guard scans by path — a `Bun` call in a plain `src/lib/*.ts` imported by a loader passes the build and throws at request time, so keep Bun code under `src/lib/server/`. `BOSIA_WORKERS_GUARD=0` downgrades the guard to a warning; only use it for code you know never runs on Workers.

### R6 — The response cache is per isolate

`invalidate()` clears only the isolate that ran it; other isolates keep serving their copy until evicted. Don't rely on the cache for data that must be fresh right after a write — `export const cache = false` on those routes (see [[bosia-response-cache]]).

## Anti-patterns

- Reading a binding from `process.env.DB` or a module-level global — bindings are only on `event.platform.env`.
- Putting secrets in `wrangler.jsonc` `vars` — use `wrangler secret put`.
- Expecting `.env.production` values in a deployed worker.
- Setting `BOSIA_WORKERS_GUARD=0` to get past a real `Bun.*` call.

## Checklist gate

P0:

- [ ] `target: "workers"` set (or `--target=workers` in the deploy script).
- [ ] No `Bun.*` / `fs` / `bun:*` in server code reachable on Workers.
- [ ] Bindings read via `event.platform.env`, typed through a module `.d.ts`.
- [ ] Secrets via `wrangler secret put`; `.dev.vars` gitignored.

P1:

- [ ] Routes needing read-after-write freshness opt out of the response cache.
- [ ] Worker bundle under the plan's size limit (free tier: 3 MB gzipped).

## Cross-references

- [[bosia-bun-runtime]] — the Bun APIs this target can't use.
- [[bosia-env]] — prefix rules; values on Workers per R4.
- [[bosia-response-cache]] — cache opt-outs.
- [[bosia-hooks]] — `event.platform` is on the hook event too.
