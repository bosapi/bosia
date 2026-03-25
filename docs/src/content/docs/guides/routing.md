---
title: Routing
description: File-based routing with dynamic params, catch-all routes, route groups, and layouts.
---

Bosbun uses **file-based routing**. Files in `src/routes/` map directly to URLs.

## Static Routes

```
src/routes/+page.svelte          →  /
src/routes/about/+page.svelte    →  /about
src/routes/blog/+page.svelte     →  /blog
```

Each `+page.svelte` file becomes a page at its directory's path.

## Dynamic Routes

Wrap a directory name in brackets to create a dynamic segment:

```
src/routes/blog/[slug]/+page.svelte  →  /blog/hello-world
                                        /blog/my-post
                                        /blog/anything
```

Access the matched value via `params`:

```ts
// +page.server.ts
export async function load({ params }: LoadEvent) {
  const post = await getPost(params.slug);
  return { post };
}
```

## Catch-All Routes

Use `[...rest]` to match multiple path segments:

```
src/routes/all/[...catchall]/+page.svelte  →  /all/a
                                               /all/a/b/c
                                               /all/anything/here
```

`params.catchall` contains the full matched sub-path (e.g. `"a/b/c"`).

## Route Groups

Directories wrapped in parentheses are **invisible in the URL** but let you share layouts:

```
src/routes/(public)/+layout.svelte    ← shared layout
src/routes/(public)/+page.svelte      →  /
src/routes/(public)/about/+page.svelte →  /about

src/routes/(admin)/+layout.svelte     ← different layout
src/routes/(admin)/dashboard/+page.svelte →  /dashboard
```

The `(public)` and `(admin)` groups never appear in the URL. They only control which `+layout.svelte` wraps the pages inside.

## Route Priority

When multiple routes could match a URL, Bosbun resolves them in order:

1. **Exact matches** — static routes like `/about`
2. **Dynamic segments** — `[param]` routes
3. **Catch-all** — `[...rest]` routes

## Layouts

`+layout.svelte` wraps all pages and child layouts in its directory:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../app.css";
  let { children, data } = $props();
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<main>
  {@render children()}
</main>
```

Layouts nest automatically — the root layout wraps group layouts, which wrap page layouts. Child content renders where `{@render children()}` appears.

### Layout Data

Pair a layout with `+layout.server.ts` to load data:

```ts
// src/routes/+layout.server.ts
import type { LoadEvent } from "bosbun";

export async function load({ locals }: LoadEvent) {
  return {
    appName: "My App",
    user: locals.user,
  };
}
```

All child pages and layouts can access this data via `parent()` in their own loaders.

## Error Pages

Create `+error.svelte` to handle errors thrown by loaders:

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  let { error } = $props();
</script>

<h1>{error.status}</h1>
<p>{error.message}</p>
```

The error page receives the `HttpError` thrown by `error()` in a loader. Place it at the route level where you want to catch errors — it catches errors from all child routes.
