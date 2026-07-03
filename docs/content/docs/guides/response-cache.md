---
title: Response Cache
description: Skip load() + render() + compression on cache hit. Per-user safe via identity hash. Invalidate from server actions with invalidate(key) / invalidateAll(prefix).
---

Since v0.6, Bosia keeps an in-memory **response cache** that serves SSR HTML and `+server.ts` GET responses directly from compressed bytes when the same URL is requested again. On a cache hit there is no `load()`, no `render()`, and no compression — typically a sub-millisecond response.

The cache is **safe for logged-in users** because the key includes a hash of cookies and headers named in `CACHE_KEYS`. Two users with different session cookies get different cache entries.

## How a request flows

1. Look up `<dedup-key>|i=<identity-hash>` in the cache.
2. **Hit** → serve the matching compressed variant (brotli, gzip, or identity) based on `Accept-Encoding`. Done.
3. **Miss** → run `metadata()`, run `load()`, render, build HTML chunks, stream the response. Compression + cache write happen in a microtask after the response goes out.

## Per-user isolation

The cache key is:

```
<normalized-path>?<sorted-query>|i=<identity-hash>
```

`identity-hash` is built from every cookie AND header whose name appears in `CACHE_KEYS`. The default value covers common session names:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization
```

Add custom names if your app uses a different cookie or header for authentication. Any non-empty value contributes to the hash; two requests with the same set of values share a cache entry, two with different values do not.

> **⚠️ Using a custom session cookie? Register it — or personalised pages will leak between users.** If your session cookie is named anything not in the list above (e.g. `my_app_sess`), the cache cannot tell your users apart: the first user's rendered page is cached and **served to every other user**. Either add the name to `CACHE_KEYS`, or set `export const cache = false` on the personalised routes. This is the same contract as configuring `Vary`/cache keys on a CDN — the framework cannot key on every cookie (analytics and timestamp cookies would make the hit rate zero), so the allowlist is authoritative.

Bosia reminds you of this contract twice, in dev **and** prod:

- **At startup** — the last line of boot output lists the active identity keys: `🔑 Response cache tells users apart ONLY by these cookies/headers: […]`.
- **At runtime** — whenever a cached response's loader read a cookie that is **not** in `CACHE_KEYS`, it logs a `🚨 SECURITY WARNING` naming the cookie (once per cookie name). If you see it, apply one of the two fixes above.

If a route's per-user content is not keyed by anything in `CACHE_KEYS`, opt it out (see below).

## Eligibility

| Condition                                 | Result                 |
| ----------------------------------------- | ---------------------- |
| `export const cache = false` on the route | Skip read + write      |
| Request method ≠ `GET`                    | Skip read + write      |
| `CSP_DIRECTIVES` set (CSP enabled)        | Skip read + write      |
| `CACHE_MAX_ENTRIES=0`                     | Skip read + write      |
| Response status ≠ 200                     | Skip write             |
| Handler called `cookies.set()`            | Skip write             |
| `?_invalidated=…` query present           | Skip read; still write |

A skip never breaks the response — it just falls back to the normal render path.

## Opting out per route

Add `export const cache = false;` to a `+page.ts`, `+page.server.ts`, or `+server.ts` file:

```ts
// +page.server.ts
import type { CacheOption } from "./$types";
export const cache: CacheOption = false;
```

Use this for live data (ticker, per-second counter) or pages where personalisation is not covered by `CACHE_KEYS`.

Note that `$types` is only generated for page routes — API `+server.ts` handlers don't have one. Use the literal there:

```ts
// +server.ts (API)
export const cache = false;
```

## Opting out per response (`Cache-Control` header)

When the route is cacheable in general but a specific response must not be cached, set `Cache-Control` on the response. Bosia honours `no-store`, `no-cache`, and `private` and skips the cache write for that response only:

```ts
// +server.ts
export async function GET() {
	const fresh = await readLiveStatus();
	return Response.json(fresh, { headers: { "cache-control": "no-store" } });
}
```

Use this when the cache decision is per-request (live polling, conditional error paths). Prefer `export const cache = false` when the whole route is dynamic.

## Server-side `invalidate()`

After a write, evict any matching cache entries so the next read serves fresh HTML:

```ts
// +page.server.ts
import { invalidate } from "bosia/server";

export const actions = {
	rename: async ({ request, locals }) => {
		await db.users.update(locals.user.id, { name: (await request.formData()).get("name") });
		invalidate("app:user");
	},
};
```

- `invalidate("app:user")` — evict every cached page whose loader called `depends("app:user")`.
- `invalidate("/api/posts")` — evict every cached page whose loader fetched `/api/posts`, plus the cached `/api/posts` API response itself.
- `invalidateAll("/products/")` — evict every entry whose path starts with the prefix.

Names mirror the existing browser-side `invalidate()` from `bosia/client`. The server version applies the same key concept to the new server cache.

## Tagging loaders

`depends()` tags both the client loader cache AND the server response cache, so one call serves both layers:

```ts
// +page.server.ts
export async function load({ depends, locals }) {
	depends("app:user");
	return { user: locals.user };
}
```

When the form action runs `invalidate("app:user")`, both caches drop the entry and the next GET re-runs `load()`.

## API endpoints

`+server.ts` GET handlers are cached with the same key rules. In v0.6 they can only be invalidated by URL or prefix — there is no `depends()` mechanism for API handlers yet:

```ts
invalidate("/api/posts"); // exact
invalidateAll("/api/"); // prefix
```

Tag-based invalidation for API endpoints is on the roadmap.

## Env vars

| Variable               | Default                                    | Purpose                                                                    |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `CACHE_KEYS`           | `session,sid,auth,token,jwt,Authorization` | Cookie/header names that contribute to the identity hash.                  |
| `CACHE_MAX_ENTRIES`    | `500`                                      | LRU capacity. `0` disables the cache entirely.                             |
| `CACHE_MAX_BODY_BYTES` | `2097152` (2MB)                            | Per-entry body size cap. Larger responses skip the cache. `0` = unlimited. |

All are read once at startup. Each entry holds the raw bytes plus gzip + brotli copies — typically a few KB.

## Verification

- `curl -i https://localhost:9000/ | grep X-Bosia-Cache` — `HIT` on the second request, missing on the first.
- `curl -H 'Accept-Encoding: br' -I` — `Content-Encoding: br` on a hit.
- `curl -H 'Cookie: session=alice' …` then `Cookie: session=bob` — both are misses (different identity hashes).

## Trade-offs

- Memory grows with `CACHE_MAX_ENTRIES × (raw + gzip + brotli)`. Tune the cap for your container.
- The cache lives in-process. A second replica has its own cache; multi-replica pub/sub invalidation is on the roadmap.
- TTL-based expiry isn't implemented — entries live until LRU eviction or explicit `invalidate()`. Author writes drive eviction.
