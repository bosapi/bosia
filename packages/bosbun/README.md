# Bosbun

> Full documentation: [bosapi.github.io/bosbun](https://bosapi.github.io/bosbun)

A fast, batteries-included fullstack framework — SSR · Svelte 5 Runes · Bun · ElysiaJS.

File-based routing inspired by SvelteKit, built on top of the Bun runtime and ElysiaJS HTTP server. No Node.js, no Vite, no adapters.

## Features

- **File-based routing** — `+page.svelte`, `+layout.svelte`, `+server.ts`, route groups, dynamic segments, catch-all routes
- **Server-side rendering** — every page is rendered on the server with full hydration
- **Server loaders** — `+page.server.ts` and `+layout.server.ts` with `parent()` data threading
- **API routes** — `+server.ts` exports HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`)
- **Middleware hooks** — `hooks.server.ts` with `sequence()` for auth, logging, locals
- **Dev server with HMR** — file watcher + SSE browser reload, no page blink
- **Tailwind CSS v4** — compiled at build time, shadcn-inspired design tokens out of the box
- **CLI** — `bosbun create`, `bosbun dev`, `bosbun build`, `bosbun add`, `bosbun feat`

## Quick Start

```bash
# Scaffold a new project
bun x bosbun create my-app
cd my-app

# Start development
bun run dev

# Build for production
bun run build
bun run start
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | [Bun](https://bun.sh) |
| HTTP Server | [ElysiaJS](https://elysiajs.com) |
| UI | [Svelte 5](https://svelte.dev) (Runes) |
| CSS | [Tailwind CSS v4](https://tailwindcss.com) |
| Bundler | Bun.build |

## Routing Conventions

Files in `src/routes/` map to URLs automatically.

| File | Purpose |
|------|---------|
| `+page.svelte` | Page component |
| `+layout.svelte` | Layout that wraps child pages |
| `+page.server.ts` | Server loader for a page |
| `+layout.server.ts` | Server loader for a layout |
| `+server.ts` | API endpoint (export HTTP verbs) |

### Dynamic Routes

| Pattern | Matches |
|---------|---------|
| `[param]` | `/blog/hello` → `params.param = "hello"` |
| `[...rest]` | `/a/b/c` → `params.rest = "a/b/c"` |

### Route Groups

Wrap a directory in parentheses to share a layout without affecting the URL:

```
src/routes/
└── (marketing)/
    ├── +layout.svelte   # shared layout
    ├── +page.svelte     # /
    └── about/
        └── +page.svelte # /about
```

## Server Loaders

```typescript
// src/routes/blog/[slug]/+page.server.ts
import type { LoadEvent } from "bosbun";

export async function load({ params, url, locals, fetch, parent }: LoadEvent) {
    const parentData = await parent(); // data from layout loaders above
    return {
        post: await getPost(params.slug),
    };
}
```

Data returned is passed as the `data` prop to `+page.svelte`:

```svelte
<script lang="ts">
    let { data } = $props();
    // data.post, data.params ...
</script>
```

## API Routes

Export named HTTP verb functions from `+server.ts`:

```typescript
// src/routes/api/items/+server.ts
import type { RequestEvent } from "bosbun";

export function GET({ params, url, locals }: RequestEvent) {
    return Response.json({ items: [] });
}

export async function POST({ request }: RequestEvent) {
    const body = await request.json();
    return Response.json({ created: body }, { status: 201 });
}
```

## Middleware Hooks

Create `src/hooks.server.ts` to intercept every request:

```typescript
import { sequence } from "bosbun";
import type { Handle } from "bosbun";

const authHandle: Handle = async ({ event, resolve }) => {
    event.locals.user = await getUser(event.request);
    return resolve(event);
};

const loggingHandle: Handle = async ({ event, resolve }) => {
    const res = await resolve(event);
    console.log(`${event.request.method} ${event.url.pathname} ${res.status}`);
    return res;
};

export const handle = sequence(authHandle, loggingHandle);
```

`locals` set here are available in every loader and API handler.

## Public API

```typescript
import { cn, sequence } from "bosbun";
import type { RequestEvent, LoadEvent, Handle } from "bosbun";
```

| Export | Description |
|--------|-------------|
| `cn(...classes)` | Tailwind class merge utility (clsx + tailwind-merge) |
| `sequence(...handlers)` | Compose multiple `Handle` middleware functions |
| `RequestEvent` | Type for API route and hook handlers |
| `LoadEvent` | Type for `load()` in `+page.server.ts` / `+layout.server.ts` |
| `Handle` | Type for a middleware function in `hooks.server.ts` |

## Path Alias

`$lib` maps to `src/lib/` out of the box:

```typescript
import { myUtil } from "$lib/utils";
```

## Project Structure

```
my-app/
├── src/
│   ├── app.css              # Global styles + Tailwind config
│   ├── hooks.server.ts      # Optional request middleware
│   ├── lib/                 # Shared utilities ($lib alias)
│   └── routes/              # File-based routes
├── public/                  # Static assets (served as-is)
├── dist/                    # Build output (git-ignored)
└── package.json
```

## License

MIT
