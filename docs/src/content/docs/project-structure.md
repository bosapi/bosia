---
title: Project Structure
description: Understand the files and directories in a Bosbun project.
---

## Directory Layout

```
my-app/
├── src/
│   ├── routes/            # Pages and API endpoints
│   │   ├── +page.svelte
│   │   ├── +layout.svelte
│   │   └── about/
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   ├── lib/               # Shared code (aliased as $lib)
│   │   └── utils.ts
│   ├── app.css            # Global styles + Tailwind tokens
│   ├── app.d.ts           # Type declarations
│   └── hooks.server.ts    # Middleware (optional)
├── public/                # Static assets (served as-is)
├── dist/                  # Build output (gitignored)
├── .bosbun/               # Generated files (gitignored)
├── .env                   # Environment variables
└── package.json
```

## Special Files

| File                  | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `+page.svelte`        | Page component — renders at the route's URL      |
| `+layout.svelte`      | Layout — wraps child pages and layouts            |
| `+page.server.ts`     | Server loader — runs `load()` and `metadata()` on the server |
| `+layout.server.ts`   | Layout loader — data shared with all child routes |
| `+server.ts`          | API endpoint — exports HTTP verb functions        |
| `+error.svelte`       | Error page — renders when a loader throws         |
| `hooks.server.ts`     | Middleware — intercepts every request              |
| `app.css`             | Global styles — Tailwind directives and design tokens |

## Path Aliases

| Alias   | Maps to     | Example                            |
| ------- | ----------- | ---------------------------------- |
| `$lib`  | `src/lib/`  | `import { cn } from "$lib/utils"` |

## Generated Files

The `.bosbun/` directory is created during `dev` and `build`. It contains:

- **`routes.ts`** — the route manifest (page and API route mappings)
- **`types/`** — auto-generated TypeScript types (`PageData`, `ActionData`, etc.)
- **`env.server.ts`** / **`env.client.ts`** — typed environment variable modules

These files are gitignored. They're regenerated every time you run `dev` or `build`.
