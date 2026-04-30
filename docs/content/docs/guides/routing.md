---
title: Routing
description: File-based routing with dynamic params, catch-all routes, route groups, and layouts.
---

Bosia uses **file-based routing**. Files in `src/routes/` map directly to URLs.

## Static Routes

```bash
src/routes/+page.svelte          →  /
src/routes/about/+page.svelte    →  /about
src/routes/blog/+page.svelte     →  /blog
```

Each `+page.svelte` file becomes a page at its directory's path.

## Dynamic Routes

Wrap a directory name in brackets to create a dynamic segment:

```bash
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

```bash
src/routes/all/[...catchall]/+page.svelte  →  /all/a
                                               /all/a/b/c
                                               /all/anything/here
```

`params.catchall` contains the full matched sub-path (e.g. `"a/b/c"`).

## Route Groups

Directories wrapped in parentheses are **invisible in the URL** but let you share layouts:

```bash
src/routes/(public)/+layout.svelte          ← shared layout
src/routes/(public)/+page.svelte            →  /
src/routes/(public)/about/+page.svelte      →  /about

src/routes/(admin)/+layout.svelte           ← different layout
src/routes/(admin)/dashboard/+page.svelte   →  /dashboard
```

The `(public)` and `(admin)` groups never appear in the URL. They only control which `+layout.svelte` wraps the pages inside.

## Route Priority

When multiple routes could match a URL, Bosia resolves them in order:

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
import type { LoadEvent } from "bosia";

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

<h1>{error.status}</h1><p>{error.message}</p>
```

The error page receives the `HttpError` thrown by `error()` in a loader. Place it at the route level where you want to catch errors — it catches errors from all child routes.

## Page Options

Toggle rendering behavior per page by exporting flags from `+page.server.ts`:

```ts
// src/routes/dashboard/+page.server.ts
export const ssr = false; // skip server render, ship shell + hydrate on client
export const csr = false; // skip client hydration, server-rendered HTML only
export const prerender = true; // build to static HTML at `bosia build`
export const trailingSlash = "never"; // canonicalize URL form: "never" | "always" | "ignore"
```

- `ssr = false` — server `load()` still runs and its result is injected as page data; the client hydrates and renders. Use for pages with browser-only deps (`window`, charts, third-party widgets) or auth-gated views where SSR adds latency without SEO value.
- `csr = false` — no JS shipped for the page. Static HTML only.
- `prerender = true` — captured at build time. For dynamic routes, also export `entries()` returning the param values to prerender.
- `trailingSlash` — canonicalize the URL form. Defaults to `"never"`.
    - `"never"` (default) — `/about/` → 308 → `/about`. Static export emits `about.html`.
    - `"always"` — `/about` → 308 → `/about/`. Static export emits `about/index.html`.
    - `"ignore"` — accept both forms with no redirect. Discouraged for SEO; useful when behind a CDN that already canonicalizes.
    - Set on `+layout.server.ts` to cascade to all child pages; child page wins on conflict.
    - 308 (permanent) preserves the request method, so form `POST`s submitted to the wrong slash still reach the action.
    - Root `/` is never modified. API routes (`+server.ts`) are unaffected.

`ssr = false` together with `csr = false` would render nothing and is overridden to `csr = true` (with a dev warning). `ssr = false` together with `prerender = true` is contradictory; the route is skipped during prerender.
