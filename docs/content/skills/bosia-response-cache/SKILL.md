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

This works identically in `+layout.server.ts`, and the tag propagates to every page rendered under that layout — `collectTags()` merges layout and page deps into one tag set per cached document.

R2.1. **`invalidate` from `bosia/client` and from `bosia/server` are different functions.** The client one re-runs loaders in the browser; the server one evicts rendered HTML. A mutation that changes SSR output needs **both** — calling only the client one updates the live UI and lets the next refresh revert it.

Also, the client `invalidate()` **resolves immediately**: it flags the loader and bumps a tick without waiting for the refetch, so `await invalidate(...)` carries no ordering guarantee. Never race it against `goto()` — the navigation supersedes the in-flight refetch after the dirty flag was already consumed, and the stale value sticks. Await the `goto()` first, then invalidate.

R3. **Opt out per route when the cost outweighs the benefit.** Pages that change on every request (live ticker, per-second counter) or pages with personalised content not covered by `CACHE_KEYS` should opt out.

**For page routes the export MUST be in `+page.svelte`, inside `<script module>`.** Putting it in `+page.server.ts` compiles, type-checks, and does nothing — the page stays cached. `core/scanner.ts` (`readPageCache`) reads `+page.svelte` at scan time, and the runtime fallback reads the compiled `+page.svelte` module (`renderer.ts` → `pageMod.cache`). The server module is never consulted for this flag.

```svelte
<!-- ✅ +page.svelte -->
<script module lang="ts">
	export const cache = false;
</script>
```

```ts
// ❌ +page.server.ts — silently ignored for page routes
export const cache = false;
```

```ts
// ✅ +server.ts (API) — no component exists, so it belongs here
export const cache = false;
```

Verify rather than assume — the failure is silent:

```ts
import { scanRoutes } from "bosia/src/core/scanner.ts";
for (const r of scanRoutes().pages) console.log(r.cache, r.pattern); // false = opted out
```

R3.1. **Authenticated app shells: the sidebar trap.** When a `+layout.server.ts` loads per-user mutable data (conversations, projects, notifications), the entire HTML document — sidebar included — is cached for **every page under that layout**.

The symptom is reliably misread as a client bug:

1. Delete a row → it vanishes from the sidebar ✅
2. Refresh → **the row is back** ❌

Both are working as designed. Step 1 goes through client `invalidate()`, which appends `?_invalidated=…` and therefore **skips the cache read**. Step 2 is a plain GET and is served from cache. So clicking through the app never exposes the staleness — only a hard refresh does, which is why this ships.

Tag the layout with `depends()` and evict from **every** write path — that is what tags are for, and a tag on a layout loader covers every page beneath it. Opting out (`export const cache = false` on each `+page.svelte`) is the fallback for pages with no natural tag boundary, or where the writers cannot be enumerated with confidence.

Two failure modes decide whether tagging holds:

- **Ordering-only writes count.** A list sorted by `updated_at` goes stale whenever anything bumps that column — not just create/delete. In a chat app that is every message, so the hot path needs an `invalidate()` too.
- **Background jobs must evict themselves.** An action that starts an async job and returns evicts only the state at kick-off; the job then writes for minutes with no request in flight. Call `invalidate()` from inside the job — at each checkpoint and on completion — never only from the action that launched it.

```ts
// long-running sweep, evicting its own tag
for (const source of sources) {
	await processSource(source);
	invalidate("app:ingest"); // per item, so a mid-run reload isn't frozen at t=0
}
await finishRun(run.id);
invalidate("app:ingest");
```

Keep the tag strings in one shared module imported by both the loaders and the writers. A typo is silent in both directions: the loader keeps its old tag and the eviction matches nothing.

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
- [ ] **Page opt-outs are in `+page.svelte` `<script module>`, not `+page.server.ts`** — verified via `scanRoutes()`, not by reading the source.
- [ ] Any `(private)`/authenticated layout that loads mutable per-user data is tagged with `depends()` and evicted from every write path (or opted out).
- [ ] Ordering-only writes (`updated_at` bumps that re-sort a list) invalidate too — not just create/delete.
- [ ] Background jobs call `invalidate()` themselves; the action that launched them is not enough.
- [ ] Tag strings come from one shared constants module, not inline literals.
- [ ] If the page sets cookies on read, either skip the cookie or opt out — partial caching is a footgun.

## How to test it (the click-through will lie to you)

Client-side navigation appends `?_invalidated=…`, which bypasses the cache — so the app
always looks correct while you click. Every cache check must therefore use a **hard reload**:

1. Mutate the data.
2. Confirm the UI updated (this only proves the client path works).
3. **Hard-reload the page** and confirm it is _still_ correct.
4. Reload once more — a stale entry can be re-populated by the first reload.

Step 3 is the only one that exercises the response cache.
