---
title: Server Loaders
description: Load data on the server with load(), metadata(), and parent() data threading.
---

Server loaders run on every request to fetch data for pages and layouts.

## Page Loaders

Export a `load` function from `+page.server.ts`:

```ts
import type { LoadEvent } from "bosia";

export async function load({ params, url, locals, cookies }: LoadEvent) {
	const post = await db.getPost(params.slug);
	return { post };
}
```

The returned object becomes the `data` prop in `+page.svelte`:

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.post.title}</h1><p>{data.post.content}</p>
```

## Layout Loaders

`+layout.server.ts` works the same way but its data is available to **all child routes**:

```ts
// src/routes/+layout.server.ts
import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	return {
		appName: "Bosia Demo",
		requestTime: locals.requestTime,
	};
}
```

## Data Threading with parent()

Child loaders can access data from parent layout loaders:

```ts
// src/routes/blog/[slug]/+page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ params, parent }: LoadEvent) {
	const parentData = await parent();
	const post = await db.getPost(params.slug);

	return {
		post,
		appName: parentData.appName, // from root layout loader
	};
}
```

Data flows top-down: root layout → group layout → page layout → page.

## Metadata

Export a `metadata` function to set page title and meta tags:

```ts
import type { MetadataEvent, LoadEvent } from "bosia";

export function metadata({ params }: MetadataEvent) {
	const post = getPost(params.slug);
	return {
		title: `${post.title} — My Blog`,
		description: `A blog post about ${params.slug}`,
		meta: [{ property: "og:title", content: post.title }],
		// Pass data to load() — avoids duplicate queries
		data: { post },
	};
}

export async function load({ params, parent, metadata }: LoadEvent) {
	const parentData = await parent();
	// Reuse data from metadata() — no duplicate DB query
	const post = metadata?.post ?? getPost(params.slug);
	return { post, appName: parentData.appName };
}
```

The `data` property in `metadata()` return value is passed to `load()` as `event.metadata`. This lets you fetch data once and share it between both functions.

For the full guide on `metadata()` — including Open Graph tags, language/link tags, and all available properties — see [Server Metadata](/guides/server-metadata).

## LoadEvent Properties

| Property   | Type                     | Description                                       |
| ---------- | ------------------------ | ------------------------------------------------- |
| `url`      | `URL`                    | The request URL                                   |
| `params`   | `Record<string, string>` | Dynamic route parameters                          |
| `locals`   | `Record<string, any>`    | Data set by middleware hooks                      |
| `cookies`  | `Cookies`                | Read/write cookies                                |
| `fetch`    | `Function`               | Fetch helper (cookies forwarded same-origin only) |
| `parent`   | `() => Promise<Record>`  | Data from parent layout loaders                   |
| `metadata` | `Record \| null`         | Data passed from `metadata()` function            |

## Cookie Forwarding

The `fetch` helper forwards the user's cookies **only on same-origin requests**, or to origins listed in the `INTERNAL_HOSTS` env var. Cross-origin requests to third-party hosts (e.g. `https://api.weather.com`) get **no Cookie header** to prevent leaking the session token.

```ts
// Same-origin → cookie forwarded automatically
const me = await fetch("/api/me");

// Third-party → NO cookie sent. Pass auth explicitly.
const weather = await fetch("https://api.weather.com/v1/now", {
	headers: { Authorization: `Bearer ${process.env.WEATHER_API_KEY}` },
});
```

For cross-origin internal services that legitimately share the session cookie (e.g. a sibling backend on a subdomain or another container), allowlist their origins:

```bash
# .env
INTERNAL_HOSTS=https://api.example.com,http://users-svc:8080
```

Comma-separated list of full origins. Malformed entries are skipped with a warning at startup. To override per request, pass `init.headers.cookie` or an `Authorization` header explicitly — those are never overwritten.

## Error Handling

Throw errors from loaders to show the error page:

```ts
import { error, redirect } from "bosia";

export async function load({ params }: LoadEvent) {
	const post = await db.getPost(params.slug);

	if (!post) {
		error(404, "Post not found");
	}

	if (post.isPrivate) {
		redirect(303, "/login");
	}

	return { post };
}
```

Redirects are validated to prevent open redirect attacks — only relative paths are allowed by default. For external redirects (e.g., OAuth), opt in explicitly:

```ts
redirect(303, "https://oauth.provider.com/authorize", {
	allowExternal: true,
});
```

## Caching

Bosia automatically sets `Cache-Control` headers on data responses (`/__bosia/data/`) based on whether cookies were accessed during loading:

- **Cookies accessed** → `Cache-Control: private, no-cache` — prevents CDNs/proxies from caching per-user data
- **No cookies accessed** → `Cache-Control: public, max-age=0, must-revalidate` — allows shared caches to store the response but requires revalidation

This means public pages (e.g. blog posts) are safely cacheable by CDNs, while authenticated pages (e.g. dashboards) are marked private automatically.

```ts
// Public page — no cookies read, response is cache-friendly
export async function load({ params }: LoadEvent) {
	const post = await db.getPost(params.slug);
	return { post };
}

// Authenticated page — cookies.get() triggers private caching
export async function load({ cookies, locals }: LoadEvent) {
	const session = cookies.get("session_id");
	const dashboard = await getDashboard(session);
	return { dashboard };
}
```

Under the hood, Bosia tracks whether `cookies.get()` or `cookies.getAll()` was called during `load()` or `metadata()`. If either was called, the response is marked `private`. This mirrors SvelteKit's behavior.

## Request Deduplication

When multiple clients hit the same route at the same time, Bosia automatically deduplicates the loader execution. Instead of running `load()` once per request, concurrent identical requests share a single in-flight promise.

For example, 10 users requesting `/products` simultaneously results in **one** `load()` call — all 10 receive the same result.

### How it works

- The dedup key is built from the **route path** + **sorted query params** + **user identity**
- If a matching request is already in-flight, new requests wait for the same promise
- Once the promise settles (resolves or rejects), the entry is removed — no stale data, no TTL
- Each request still gets its own HTTP response with its own headers and cookies

### User identity

Dedup uses the `Authorization` header or an `authorization` cookie (case-insensitive) to distinguish users:

- **Anonymous requests** (no auth) share the same dedup key — maximum deduplication
- **Authenticated requests** are keyed per user — different users always run separate loaders

:::caution
If your app uses a **different cookie name** for authentication (not `authorization`), dedup will treat authenticated users as anonymous and share loader results between them. Use the `Authorization` header or rename your auth cookie to `authorization`.
:::

### Scope

Dedup applies **only** to the `/__bosia/data/` endpoint (client-side navigation data fetches). It does **not** apply to:

- SSR page renders (initial page load)
- POST/PUT/DELETE requests
- API routes (`+server.ts`)

## Timeouts

Loaders have configurable timeouts to prevent hung responses:

| Env Variable       | Default | Description                    |
| ------------------ | ------- | ------------------------------ |
| `LOAD_TIMEOUT`     | —       | Timeout for `load()` in ms     |
| `METADATA_TIMEOUT` | —       | Timeout for `metadata()` in ms |
