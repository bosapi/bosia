---
title: SvelteKit Differences
description: What's the same, what's different, and what's not supported compared to SvelteKit.
---

Bosia follows SvelteKit conventions closely, but there are important differences.

## Same as SvelteKit

These work the same way you'd expect:

- **File conventions** — `+page.svelte`, `+layout.svelte`, `+page.server.ts`, `+layout.server.ts`, `+server.ts`, `+error.svelte`
- **Route groups** — `(name)` directories invisible in URLs
- **Dynamic routes** — `[param]` and `[...rest]` segments
- **`load()` function** — same signature with `params`, `url`, `locals`, `cookies`, `parent()`
- **`Handle` type** — `({ event, resolve }) => Response`
- **`sequence()`** — compose middleware handlers
- **Form actions** — `actions` export with `fail()` and `redirect()`
- **Cookie API** — `get()`, `getAll()`, `set()`, `delete()`
- **`$lib` alias** — maps to `src/lib/`
- **CSRF protection** — origin-based checking on non-safe methods
- **Data invalidation** — `depends()` on `LoadEvent`, plus `invalidate()` / `invalidateAll()` exported from `bosia/client`
- **Navigation API** — `goto()`, `beforeNavigate()`, `afterNavigate()` from `bosia/client`
- **Plugin system** — `bosia.config.ts` with hooks for backend, build, render, and client lifecycle

## Different from SvelteKit

| Feature                 | SvelteKit                     | Bosia                                             |
| ----------------------- | ----------------------------- | ------------------------------------------------- |
| **Runtime**             | Node.js                       | Bun                                               |
| **Bundler**             | Vite                          | Bun.build                                         |
| **HTTP server**         | Configurable via adapters     | Built-in (`Bun.serve` / Workers `fetch`)          |
| **Adapters**            | Required (node, vercel, etc.) | None — single Bun server                          |
| **Universal load**      | `+page.ts` / `+layout.ts`     | Not supported — server loaders only               |
| **Stores**              | `$app/stores`                 | Not available — use `$props()`                    |
| **Env vars**            | `$env/static/public`, etc.    | `$env` with four-tier prefix                      |
| **HMR**                 | Vite HMR (granular)           | SSE full-page reload                              |
| **Generated dir**       | `.svelte-kit/`                | `.bosia/`                                         |
| **Component registry**  | None                          | `bosia add` (shadcn-style)                        |
| **Feature scaffolding** | None                          | `bosia feat`                                      |
| **Metadata**            | Via `<svelte:head>`           | `metadata()` function in `+page.server.ts`        |
| **Response caching**    | Not built-in                  | Server-side cache with LRU + brotli/gzip          |
| **`data` prop**         | Layout data merged into pages | Each load is separate — thread via `parent()`     |
| **Loading skeletons**   | Manual (`navigating` store)   | `+loading.svelte` file convention (Next.js-style) |

### Key Differences Explained

**No universal load functions** — Bosia only supports server-side `load()` in `+page.server.ts` and `+layout.server.ts`. There is no `+page.ts` or `+layout.ts` for client-side or universal loading.

**No `$app/stores`** — Instead of stores, access data via Svelte 5 runes:

```svelte
<!-- SvelteKit -->
<script>
  import { page } from "$app/stores";
</script>

<!-- Bosia -->
<script>
  let { data } = $props();
</script>
```

**Layout data is not merged into the page `data` prop** — In SvelteKit, a `+page.svelte`'s `data` is the union of every ancestor `+layout` load plus the page's own. In Bosia each load result stays separate: a page's `data` holds **only** that page's `load()` return, and each layout component gets its own. So `data.session` (or any key a parent layout returned) is `undefined` in a page unless the page's own loader re-returned it. Thread parent data explicitly via `parent()` in the page loader — see [Server Loaders](/guides/server-loaders#data-threading-with-parent). This avoids key collisions and per-page payload bloat at the cost of one extra line per page that needs ancestor data.

**`metadata()` function** — Unique to Bosia. Returns `title`, `description`, and `meta` tags. Can pass `data` to `load()` to avoid duplicate database queries.

**`$env`** — Instead of SvelteKit's four separate `$env/*` sub-modules, Bosia uses a single `$env` module with a prefix-based system:

```ts
// SvelteKit
import { PUBLIC_KEY } from "$env/static/public";
import { SECRET } from "$env/static/private";

// Bosia
import { PUBLIC_STATIC_KEY, SECRET } from "$env";
```

## Not Supported

These SvelteKit features are not available in Bosia:

- `+page.ts` / `+layout.ts` (universal load functions)
- `$app/stores` (`page`, `navigating`, `updated`)
- Image optimization (`@sveltejs/enhanced-img`)
- Service workers
- Snapshots
- Shallow routing (`pushState` / `replaceState`)
- Adapter system (Bun and Cloudflare Workers are built in)
- `<svelte:head>` for metadata (use `metadata()` instead)
