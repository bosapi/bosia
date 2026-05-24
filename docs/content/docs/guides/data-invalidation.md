---
title: Data Invalidation
description: Use depends(), invalidate(), and invalidateAll() to control when server loaders re-run on client-side navigation.
---

By default, Bosia caches the result of every `+page.server.ts` and `+layout.server.ts` `load()` function in the browser after the first run. On the next client-side navigation, a loader only re-runs when something it actually read has changed — a route param, a search param, a tracked URL, or a key the loader declared via `depends()`. Layouts that haven't conceptually changed (e.g. a navbar that only reads `locals.user`) skip the server round-trip entirely.

This is the same model as SvelteKit: opt-in, predictable, and explicit.

## Automatic dependency tracking

A loader automatically depends on:

- Every `params.X` it reads
- Every `url.searchParams.get(X)` or `.has(X)` it reads
- Every `url.pathname`/`origin`/`href` read
- Every `cookies.get(X)` it reads
- Every URL it passes to the injected `fetch()`

```ts
// +page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ params, url, fetch }: LoadEvent) {
	const q = url.searchParams.get("q") ?? "";
	const res = await fetch(`/api/posts?q=${q}&slug=${params.slug}`);
	return { posts: await res.json() };
}
```

This loader re-runs when `params.slug` changes, when `?q=` changes, or when something explicitly invalidates `/api/posts?q=...`. Navigating to a sibling route that shares the same params re-uses the cached result.

## `depends()`

Declare a custom dependency key inside a loader:

```ts
export async function load({ depends, locals }: LoadEvent) {
	depends("app:user");
	return { user: locals.user };
}
```

Call `invalidate("app:user")` from anywhere on the client to force this loader to re-run on the next navigation.

## `invalidate()`

```ts
import { invalidate } from "bosia/client";

// Custom key (matches `depends("app:user")`)
await invalidate("app:user");

// URL (matches any loader that fetched this URL)
await invalidate("/api/posts");

// Predicate over the tracked URL
await invalidate((url) => url.pathname.startsWith("/api/"));
```

Invalidation marks the matching cache entries dirty and re-runs only those loaders the next time the nav effect fires. Calling `invalidate()` outside of a navigation (e.g. after a WebSocket message) triggers a re-run on the current URL.

## `invalidateAll()`

```ts
import { invalidateAll } from "bosia/client";

await invalidateAll();
```

Wipes every cache entry. Every loader re-runs on the next nav.

## Form actions

`use:enhance` invalidates **the page loader only** by default. Layouts stay cached. If a mutation should also re-run a layout (e.g. updating the user's display name in the navbar), call `invalidate()` from the submit handler:

```svelte
<script lang="ts">
	import { enhance } from "bosia/client";
	import { invalidate } from "bosia/client";
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			await invalidate("app:user");
		};
	}}
>
	<!-- ... -->
</form>
```

## Caveats

- **`setHeaders`**: a cached loader does not re-apply response headers. If a loader sets `Cache-Control` or `Set-Cookie` via `setHeaders`, ensure those don't depend on data the loader skips.
- **`metadata()`**: page-level `metadata()` always runs on every navigation. Cache scope is loaders only.
- **Hard refresh**: the cache lives in browser memory and is wiped on full reload. The next navigation behaves like a first-load.
- **Private routes**: cache lives per-browser, so `(private)` routes are safe — there is no cross-user leakage. Server-side request dedup remains disabled for `(private)` routes as before.

## Server-side `invalidate()` for the response cache

The browser-side `invalidate()` evicts the per-browser loader cache. Since v0.6 Bosia also keeps a **server-side** response cache that skips `load()` + `render()` + compression on cache hits. It's evicted with a parallel API exported from the main entry:

```ts
import { invalidate, invalidateAll } from "bosia";

// Form action — re-render the next GET of any page that called depends("app:user")
export const actions = {
	default: async ({ request }) => {
		await updateUserName(request);
		invalidate("app:user");
	},
};
```

- `invalidate("app:user")` evicts every cached page whose loader called `depends("app:user")`.
- `invalidate("/api/posts")` evicts every cached page whose loader fetched `/api/posts`, plus the cached `/api/posts` API response itself.
- `invalidateAll("/products/")` evicts every cached entry whose path starts with `/products/`.

Form actions are the most common invalidation point — after a mutation, call `invalidate()` so the next read serves fresh HTML. The function returns synchronously (no `await` needed).

API endpoints (`+server.ts`) are invalidated by URL/prefix only in v0.6. Tag-based invalidation for API handlers is on the roadmap.

Opt a route out of the server cache entirely with `export const cache = false;` in `+page.ts`, `+page.server.ts`, or `+server.ts`. See [Response cache](/guides/response-cache) for the full design.
