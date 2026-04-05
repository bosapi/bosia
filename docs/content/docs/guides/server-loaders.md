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

<h1>{data.post.title}</h1>
<p>{data.post.content}</p>
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
    meta: [
      { property: "og:title", content: post.title },
    ],
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

## LoadEvent Properties

| Property   | Type                     | Description                              |
| ---------- | ------------------------ | ---------------------------------------- |
| `url`      | `URL`                    | The request URL                          |
| `params`   | `Record<string, string>` | Dynamic route parameters                 |
| `locals`   | `Record<string, any>`    | Data set by middleware hooks             |
| `cookies`  | `Cookies`                | Read/write cookies                       |
| `fetch`    | `Function`               | Session-aware fetch (forwards cookies)   |
| `parent`   | `() => Promise<Record>`  | Data from parent layout loaders          |
| `metadata` | `Record \| null`         | Data passed from `metadata()` function   |

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

## Timeouts

Loaders have configurable timeouts to prevent hung responses:

| Env Variable         | Default | Description                  |
| -------------------- | ------- | ---------------------------- |
| `LOAD_TIMEOUT`       | —       | Timeout for `load()` in ms   |
| `METADATA_TIMEOUT`   | —       | Timeout for `metadata()` in ms |
