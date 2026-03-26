---
title: Getting Started
description: Create your first Bosia project in under a minute.
---

## Prerequisites

- [Bun](https://bun.sh) >= 1.x — Bosia runs entirely on Bun. No Node.js required.

## Create a New Project

```bash
bunx bosia create my-app
```

You'll be prompted to pick a template:

| Template    | Description                                        |
| ----------- | -------------------------------------------------- |
| **default** | Minimal starter — home page, about page, one loader |
| **demo**    | Full-featured — blog, API routes, form actions, hooks |

To skip the prompt:

```bash
bunx bosia create my-app --template demo
```

## Development

```bash
cd my-app
bun run dev
```

Open [http://localhost:9000](http://localhost:9000). The dev server watches for file changes and reloads the browser automatically via SSE — no full-page blink.

## Production Build

```bash
bun run build
bun run start
```

`build` compiles client bundles, server entry, Tailwind CSS, and prerenders static routes. `start` runs the production server.

## Your First Page

Create a new file at `src/routes/hello/+page.svelte`:

```svelte
<h1>Hello!</h1>
<p>This is my first Bosia page.</p>
```

Visit [http://localhost:9000/hello](http://localhost:9000/hello) — that's it. No config, no imports, no registration. The file-based router picks it up automatically.

## Add a Server Loader

Create `src/routes/hello/+page.server.ts` alongside the page:

```ts
import type { LoadEvent } from "bosia";

export async function load({ url }: LoadEvent) {
  return {
    greeting: `Hello from the server!`,
    timestamp: Date.now(),
  };
}
```

Access the data in your page:

```svelte
<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.greeting}</h1>
<p>Rendered at {new Date(data.timestamp).toLocaleString()}</p>
```

## Next Steps

- [Project Structure](/project-structure/) — understand the file layout
- [Routing](/guides/routing/) — dynamic routes, groups, layouts
- [Server Loaders](/guides/server-loaders/) — load data, metadata, parent threading
- [API Routes](/guides/api-routes/) — build REST endpoints
- [Components](/components/overview/) — add UI components from the registry
