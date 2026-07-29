---
title: Response Cache
description: Skip load() + render() + compression on cache hit. Per-user safe via identity hash. Invalidate from server actions with invalidate(key) / invalidateAll(prefix).
---

Since v0.6, Bosia keeps an in-memory **response cache** that serves SSR HTML and `+server.ts` GET responses directly from compressed bytes when the same URL is requested again. On a cache hit there is no `load()`, no `render()`, and no compression — typically a sub-millisecond response.

The cache is **safe for logged-in users** because the key includes a hash of cookies and headers named in `CACHE_KEYS`. Two users with different session cookies get different cache entries.

## How a request flows

1. Look up `<dedup-key>|i=<identity-hash>` in the cache.
2. **Hit** → serve the matching compressed variant (brotli, gzip, or identity) based on `Accept-Encoding`. Done.
3. **Miss** → the **first** miss on a key becomes the leader: it runs `metadata()`, runs `load()`, renders, builds HTML chunks, and streams the response. Compression + cache write happen in a microtask after the response goes out.
4. **Concurrent misses** on the same key wait for the leader, then re-check the cache — a hit is served from cache, so N simultaneous misses build the page once instead of N times. If the leader skipped the write (e.g. it set cookies or the response wasn't cacheable), each waiter builds independently.

The identity hash here is the same one [request deduplication](./request-deduplication) uses — one `CACHE_KEYS` contract isolates users across both mechanisms.

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

> **⚠️ The runtime warning covers cookies only — not request headers.** Handlers read headers via `request.headers.get(...)` directly, so the framework cannot track header reads the way it tracks cookies. If you authorize requests by a **custom header** (`X-Api-Key`, `X-Auth-Token`, etc.) whose name is not in `CACHE_KEYS`, personalised pages leak between users with **no runtime warning**. `Authorization: Bearer` is covered by the default set; any other header-based scheme must be added to `CACHE_KEYS` by hand, or the route opted out of caching.

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

> **⚠️ For page routes the export MUST live in `+page.svelte`, inside `<script module>`.**
> Putting it in `+page.server.ts` compiles, type-checks, and is **silently ignored** — the
> page keeps being cached. The build-time scan reads `+page.svelte`
> (`core/scanner.ts` → `readPageCache`), and the runtime fallback reads the compiled
> `+page.svelte` module (`core/renderer.ts` → `pageMod.cache`). The server module's
> exports are never consulted for this flag.

```svelte
<!-- +page.svelte -->
<script module lang="ts">
	export const cache = false;
</script>

<script lang="ts">
	let { data } = $props();
</script>
```

API handlers are the opposite — they have no component, so the export goes in the handler:

```ts
// +server.ts (API)
export const cache = false;
```

Use this for live data (ticker, per-second counter) or pages where personalisation is not covered by `CACHE_KEYS`.

To confirm it took effect, check the scanned flag rather than trusting the source:

```ts
import { scanRoutes } from "bosia/src/core/scanner.ts";
for (const r of scanRoutes().pages) console.log(r.cache, r.pattern);
// false → opted out.  true → still cached.
```

### Authenticated app shells — the case that bites

If a **layout** renders per-user mutable data (a sidebar of the signed-in user's
conversations, projects, notifications), then **every page under that layout** inherits the
problem: the whole HTML document is cached, sidebar included.

The failure looks like this, and it is easy to misread as a client bug:

1. Delete a row. It disappears from the sidebar. ✅
2. Press F5. **The deleted row is back.** ❌

Both steps are working as designed. Step 1 goes through the client `invalidate()` path,
which requests `?_invalidated=…` — and per the eligibility table above, that **skips the
cache read**. Step 2 is a plain `GET` with no such param, so it is served from cache.

That asymmetry is the trap: **clicking around the app never reveals the staleness — only a
hard refresh does.** Under normal development you can easily ship this.

Two ways out:

- **Tag + evict** (keeps the cache): `depends("app:sidebar")` in the layout loader, and
  `invalidate("app:sidebar")` from **every** write path. The tag on a layout loader covers
  all pages beneath it, so one eviction clears the whole section.
- **Opt out**: `export const cache = false` in every `+page.svelte` under the layout.
  Fewer moving parts, but you give up caching for the entire authenticated area.

Tag + evict is the better default — it is what `depends()` exists for. Two things decide
whether it holds:

1. **Enumerate write paths honestly, including ordering-only writes.** A list sorted by
   `updated_at` changes whenever anything bumps that column, not only on create/delete.
   In a chat app that is _every message_, so the hot path needs an `invalidate()` too.
2. **Background work must evict itself.** An action that kicks off an async job and returns
   evicts only the state at kick-off. The job keeps writing for minutes with no request in
   flight, so nothing else will evict for it — call `invalidate()` from inside the job, at
   each checkpoint and on completion, not just from the action that started it.

Reach for the opt-out when a page has no natural tag boundary, or when you cannot enumerate
its writers with confidence — a missed writer is silent, and only shows up on someone
else's hard refresh.

```ts
// features/ingest/ingest.service.ts — a long-running sweep evicting its own tag
for (const source of sources) {
	await processSource(source);
	invalidate("app:ingest"); // per item, so a mid-run reload isn't frozen at t=0
}
await finishRun(run.id);
invalidate("app:ingest");
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

> **These are two different functions with the same name.** `invalidate` from `bosia/client`
> re-runs loaders in the browser; `invalidate` from `bosia/server` evicts server-rendered
> HTML. Calling only the client one leaves the cached document stale — the live UI updates
> and the next refresh reverts it. A mutation that changes SSR output needs **both**.

> **`invalidate()` from `bosia/client` resolves immediately.** It flags the loader and bumps
> a tick; it does not wait for the refetch, so `await invalidate(...)` gives no ordering
> guarantee. Do not race it against `goto()` — the navigation supersedes the in-flight
> refetch after the dirty flag has already been consumed, and the stale data sticks. Await
> the `goto()` first, then invalidate.

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

`depends()` works the same in `+layout.server.ts`, and the tag propagates to **every page
rendered under that layout** — `collectTags()` merges layout and page deps into one tag set
per cached document (`core/cache.ts`). That is what makes a single
`invalidate("app:sidebar")` able to clear an entire authenticated section; it is also why a
missed write path leaves _all_ of those pages stale at once.

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
