---
name: bosia-response-cache
description: Server response cache — skip-render on cache hit, keyed by URL + identity (CACHE_KEYS cookies/headers). Invalidate from server actions with `invalidate(key)` / `invalidateAll(prefix)`. Opt routes out with `export const cache = false`.
triggers:
  - invalidate
  - response cache
  - server cache
  - depends
  - cache hit
  - cache miss
  - skip render
  - CACHE_KEYS
  - CACHE_MAX_ENTRIES
  - export const cache
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

# bosia-response-cache

## What it covers

When and how to call `invalidate()` from server code so the in-memory response cache stays consistent with the database after a mutation.

## When to use

- Writing a form action (`+page.server.ts → actions`).
- Writing a mutating `+server.ts` handler (POST/PUT/PATCH/DELETE).
- Adding a `depends("ns:thing")` call inside a loader.
- Designing per-route opt-outs (`export const cache = false`).

## Mental model

Server cache and client cache share the **same key vocabulary** as the existing client `invalidate()`:

- `depends("app:user")` inside a loader tags both the client loader cache AND the cached HTML.
- `invalidate("app:user")` from `bosia` (server) evicts every cached HTML page whose loader called `depends("app:user")`.
- `invalidate("/api/posts")` from `bosia` (server) evicts cached HTML where a loader fetched `/api/posts`, AND the cached `/api/posts` API response.
- `invalidateAll("/products/")` evicts every entry whose path starts with the prefix.

Per-user isolation is automatic: the cache key includes a hash of cookies and headers named in `CACHE_KEYS` (default: `session,sid,auth,token,jwt,Authorization`). Two users with different `session` cookies never see each other's HTML.

## Rules

R1. **Call `invalidate()` after every server-side write.** If you `UPDATE users SET name=...`, the next cached page render for that user is now wrong. Pair the write with the matching key:

```ts
// +page.server.ts
import { invalidate } from "bosia/server";
import { fail } from "bosia";

export const actions = {
	rename: async ({ request, locals }) => {
		const form = await request.formData();
		await db.users.update(locals.user.id, { name: form.get("name") });
		invalidate("app:user");
	},
};
```

R2. **Tag loaders that read mutable data.** A cached page with no `depends()` is never evicted by tag — only by URL or prefix. Add `depends("ns:thing")` for anything that gets written elsewhere:

```ts
export async function load({ depends, locals }) {
	depends("app:user");
	return { user: locals.user };
}
```

R3. **Opt out per route when the cost outweighs the benefit.** Pages that change on every request (live ticker, per-second counter) or pages with personalised content not covered by `CACHE_KEYS` should opt out:

```ts
// +page.server.ts or +server.ts
import type { CacheOption } from "./$types";

export const cache: CacheOption = false;
```

`$types` is generated for `+page.server.ts` but **not** for API `+server.ts` routes. In an API handler, drop the type import and use the literal — Bosia matches on the value:

```ts
// +server.ts (API)
export const cache = false;
```

**Per-response alternative — `Cache-Control` header.** When you want the route cacheable in general but need to skip caching for specific responses (e.g. live status polling that piggy-backs on an otherwise cacheable endpoint, or a conditional that flips on error), return a response with one of `no-store`, `no-cache`, or `private`:

```ts
// +server.ts
export async function GET() {
	const fresh = await readLiveStatus();
	return Response.json(fresh, { headers: { "cache-control": "no-store" } });
}
```

Bosia's server checks the response's `Cache-Control` header and skips the cache write when any of those directives are present (see `core/server.ts`). This is honoured **per response**, so the same handler can return cached and non-cached responses based on runtime conditions. Prefer the route-level `export const cache = false` when the entire endpoint is dynamic — reach for the header only when the decision is per-request.

R4. **Don't `setCookie` in cacheable paths.** The cache write is skipped if a handler called `cookies.set()` during the request — but the cached entry can never reproduce that `Set-Cookie`. If a cookie is essential, opt the route out with `cache = false`.

R5. **API endpoints invalidate by URL only in v0.6.** `+server.ts` handlers don't have a `depends()` mechanism yet. To clear a cached API response, call `invalidate("/api/posts")` (exact path) or `invalidateAll("/api/")` (prefix). Tag support for API endpoints is on the roadmap.

R6. **CSP disables the cache.** Operators who set `CSP_DIRECTIVES` forfeit the cache (the per-request nonce can't be reproduced from cached bytes).

## Checklist before merging

- [ ] Every write path that affects a cached page calls `invalidate(<matching key>)` afterwards.
- [ ] Every cacheable loader that reads mutable data declares `depends(...)` keys.
- [ ] Routes that must not be cached (live data, per-request-cookie) opt out with `export const cache = false`.
- [ ] If the page sets cookies on read, either skip the cookie or opt out — partial caching is a footgun.
