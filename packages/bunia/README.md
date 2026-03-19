# bunia

The `bunia` package — framework core + CLI.

## Installation

```bash
bun add bunia
```

Or scaffold a new project:

```bash
bunx bunia create my-app
```

## CLI

```
bunia <command>

Commands:
  create <name>       Scaffold a new Bunia project
  dev                 Start the development server (port 3000)
  build               Build for production
  add <component>     Install a UI component from the registry
  feat <feature>      Install a feature scaffold from the registry
```

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
import type { LoadEvent } from "bunia";

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
import type { RequestEvent } from "bunia";

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
import { sequence } from "bunia";
import type { Handle } from "bunia";

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
import { cn, sequence } from "bunia";
import type { RequestEvent, LoadEvent, Handle } from "bunia";
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
