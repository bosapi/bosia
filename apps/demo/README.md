# Bunia Demo

The official demo app for the [Bunia](../../packages/bunia/README.md) framework. It demonstrates file-based routing, server loaders, API endpoints, middleware hooks, and Tailwind design tokens.

## Running

```bash
bun run dev     # http://localhost:3000
bun run build   # production build
bun run start   # run production server
```

## Routes

| URL | File | Description |
|-----|------|-------------|
| `/` | `(public)/+page.svelte` | Home page |
| `/about` | `(public)/about/+page.svelte` | About page |
| `/blog` | `(public)/blog/+page.svelte` | Blog listing |
| `/blog/:slug` | `(public)/blog/[slug]/+page.svelte` | Blog post — fetched via server loader |
| `/api/hello` | `api/hello/+server.ts` | Multi-method JSON API |
| `/*` | `(public)/[...catchall]/+page.svelte` | 404 catch-all |

## Key Files

### `src/hooks.server.ts`

Demonstrates middleware composition with `sequence()`:

- **`authHandle`** — sets `locals.requestTime` and `locals.user` on every request
- **`loggingHandle`** — logs method, path, status code, and response time; sets `X-Response-Time` header

### `src/routes/+layout.server.ts`

Root layout loader that reads `locals.requestTime` and passes it down to all layouts via `data.requestTime`.

### `src/routes/(public)/+layout.svelte`

Shared layout for all public pages. Renders a sticky nav, main content area, and a footer showing "Powered by Bunia" with an optional `requestTime` timestamp.

### `src/routes/(public)/blog/[slug]/+page.server.ts`

Server loader for individual blog posts. Demonstrates dynamic route parameters and returning data to the page component.

### `src/routes/api/hello/+server.ts`

API endpoint exporting all HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`. Visit `/api/hello` in the browser to see the GET response.

## What This Demonstrates

- Route groups — `(public)/` shares a layout without appearing in URLs
- Dynamic segments — `/blog/[slug]` with server-side data loading
- Catch-all routes — `[...catchall]` for 404 pages
- Server loaders with `parent()` — layout data flows into page loaders
- `locals` — data set in hooks is available in every loader and API handler
- Session-aware `fetch` — loaders can call internal API routes with cookies forwarded automatically
- Tailwind v4 + shadcn design tokens — semantic color classes throughout
