---
title: SvelteKit Differences
description: What's the same, what's different, and what's not supported compared to SvelteKit.
---

Bosbun follows SvelteKit conventions closely, but there are important differences.

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

## Different from SvelteKit

| Feature | SvelteKit | Bosbun |
| ------- | --------- | ------ |
| **Runtime** | Node.js | Bun |
| **Bundler** | Vite | Bun.build |
| **HTTP server** | Configurable via adapters | ElysiaJS (built-in) |
| **Adapters** | Required (node, vercel, etc.) | None — single Bun server |
| **Universal load** | `+page.ts` / `+layout.ts` | Not supported — server loaders only |
| **Stores** | `$app/stores` | Not available — use `$props()` |
| **Navigation** | `$app/navigation` | Built-in client router |
| **Env vars** | `$env/static/public`, etc. | `$env` with four-tier prefix |
| **HMR** | Vite HMR (granular) | SSE full-page reload |
| **Generated dir** | `.svelte-kit/` | `.bosbun/` |
| **Component registry** | None | `bosbun add` (shadcn-style) |
| **Feature scaffolding** | None | `bosbun feat` |
| **Metadata** | Via `<svelte:head>` | `metadata()` function in `+page.server.ts` |

### Key Differences Explained

**No universal load functions** — Bosbun only supports server-side `load()` in `+page.server.ts` and `+layout.server.ts`. There is no `+page.ts` or `+layout.ts` for client-side or universal loading.

**No `$app/stores`** — Instead of stores, access data via Svelte 5 runes:

```svelte
<!-- SvelteKit -->
<script>
  import { page } from "$app/stores";
</script>

<!-- Bosbun -->
<script>
  let { data } = $props();
</script>
```

**`metadata()` function** — Unique to Bosbun. Returns `title`, `description`, and `meta` tags. Can pass `data` to `load()` to avoid duplicate database queries.

**`$env`** — Instead of SvelteKit's four separate `$env/*` sub-modules, Bosbun uses a single `$env` module with a prefix-based system:

```ts
// SvelteKit
import { PUBLIC_KEY } from "$env/static/public";
import { SECRET } from "$env/static/private";

// Bosbun
import { PUBLIC_STATIC_KEY, SECRET } from "$env";
```

## Not Supported

These SvelteKit features are not available in Bosbun:

- `+page.ts` / `+layout.ts` (universal load functions)
- `$app/stores` (`page`, `navigating`, `updated`)
- `$app/navigation` (`goto`, `beforeNavigate`, `afterNavigate`)
- `depends()` / `invalidate()` / `invalidateAll()`
- Image optimization (`@sveltejs/enhanced-img`)
- Service workers
- Snapshots
- Shallow routing
- i18n
- Adapter system / plugin system
- `<svelte:head>` for metadata (use `metadata()` instead)
