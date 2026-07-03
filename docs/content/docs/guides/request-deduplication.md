---
title: Request Deduplication
description: Coalesce concurrent identical requests into one in-flight loader to cut redundant DB and API calls — identity-aware, so per-user routes are deduped safely.
---

When N concurrent requests hit the same URL **from the same identity**, Bosia runs the loader **once** and shares the result with every waiter. Settled responses are not cached — once the promise resolves, the next request runs `load()` fresh.

```
3 concurrent requests to /blog/post-1 (same identity)
┌─────────────┐
│ request 1 ──┐
│ request 2 ──┼──► load() runs once ──► result fans out to all 3
│ request 3 ──┘
└─────────────┘
```

This is **on by default** for every route. The dedup key is the URL (pathname + sorted query string) **plus the same identity hash the [response cache](./response-cache) uses**: a hash of every cookie and header named in `CACHE_KEYS`. Two users with different session cookies never share a loader result; two anonymous users (no `CACHE_KEYS` values) do.

:::warning[Breaking change in 0.8.4]
`(private)` route groups **no longer switch off deduplication** — dedup is now identity-aware everywhere, and the route `scope` concept is gone. `(private)` behaves like any other `(group)` folder: invisible in the URL, useful for sharing auth layouts.

If your app authenticates with a **custom cookie or header name**, add it to `CACHE_KEYS` (see below) — that is now the one contract that keeps per-user routes isolated, for both the response cache and dedup.
:::

## Per-user isolation via `CACHE_KEYS`

The identity hash is built from every cookie AND header whose name appears in `CACHE_KEYS`. The default covers common session names:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization
```

- Users with **different** values for any of these get different dedup keys — their loaders run independently and can never see each other's data.
- Requests with **no** `CACHE_KEYS` values (anonymous traffic) share one identity bucket — exactly what you want for public pages under load.

If your session cookie has a custom name (e.g. `my_app_sess`), register it:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization,my_app_sess
```

Bosia warns at runtime — in dev **and** prod — whenever a deduped or cached response's loader read a cookie that is not in `CACHE_KEYS` (a `🚨 SECURITY WARNING` naming the cookie, once per name). If you see it, add the cookie to `CACHE_KEYS` or opt the route out of caching.

## Examples

```
✅ Deduped per user

routes/dashboard/+page.server.ts
   load() reads cookies.get("session") — each session value gets its own
   loader run; concurrent requests from the SAME session share one run
```

```
✅ Deduped globally

routes/blog/[slug]/+page.server.ts
   load() reads from a CMS — anonymous requests share one loader run
```

```
❌ Unsafe — custom session cookie not registered

CACHE_KEYS is the default list, app authenticates with "my_app_sess"
   All users hash to the same identity — add my_app_sess to CACHE_KEYS
```

## Limitations

- **Dedup is concurrent-only.** Once the promise settles, the entry is removed from the in-flight map. The next request runs the loader again. This is not a TTL cache.
- **Loaders should be deterministic given the URL + identity.** If the loader's output depends on `Date.now()`, randomness, or external state that changes mid-window, every waiter sees the same snapshot from whoever triggered the call.
- **Cookies set inside a deduped loader** flow only to the request that triggered it. Other waiters receive the response body but not the `Set-Cookie` headers.
- The auto `Cache-Control` heuristic (`private, no-cache` when cookies were accessed) still applies inside the deduped block — if the underlying loader read cookies, every waiter's response is marked private.
