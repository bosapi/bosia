---
title: CLI Reference
description: All bosbun CLI commands — create, dev, build, start, add, feat.
---

## bosbun create

Scaffold a new Bosbun project.

```bash
bosbun create <name> [--template <template>]
```

| Option       | Description                              |
| ------------ | ---------------------------------------- |
| `<name>`     | Project directory name                   |
| `--template` | Skip the picker: `default` or `demo`    |

**Templates:**

- **default** — Minimal starter with home page, about page, and one server loader
- **demo** — Full-featured example with blog, API routes, form actions, hooks, and catch-all routes

After scaffolding, `bun install` runs automatically.

## bosbun dev

Start the development server with hot reload.

```bash
bosbun dev
```

- Dev server runs at **http://localhost:9000**
- File changes trigger automatic browser reload via SSE
- Uses a proxy architecture: dev proxy on `:9000`, app server on `:9001`
- **Auto-restart on crash** — if the app process exits unexpectedly, it restarts automatically. After 3 rapid crashes within 5 seconds, it stops retrying and waits for a file change.

## bosbun build

Build the project for production.

```bash
bosbun build
```

This runs:

1. Route scanning and manifest generation
2. Type generation (`$types.d.ts` files)
3. Environment variable module generation (`$env`)
4. Client bundle (JavaScript + CSS via Tailwind)
5. Server entry bundle
6. Static prerendering (routes with `export const prerender = true`)

Output goes to `dist/`.

## bosbun start

Run the production server.

```bash
bosbun start
```

Runs the built server from `dist/`. Requires `bosbun build` to have been run first.

## bosbun add

Install a UI component from the registry.

```bash
bosbun add <component>
```

- Downloads component files to `src/lib/components/ui/<component>/`
- Automatically installs component dependencies (other components it depends on)
- Installs required npm packages via `bun add`
- Registry hosted on GitHub: `bosapi/bosbun/main/registry/components/`

Example:

```bash
bosbun add button
bosbun add card
bosbun add input
```

## bosbun feat

Scaffold a feature (routes + components + server files).

```bash
bosbun feat <feature>
```

- Installs required UI components first via `bosbun add`
- Copies feature files to the appropriate locations in your project
- Installs required npm packages
- Registry hosted on GitHub: `bosapi/bosbun/main/registry/features/`

Example:

```bash
bosbun feat login
```
