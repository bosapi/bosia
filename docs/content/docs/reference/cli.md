---
title: CLI Reference
description: All bosia CLI commands — create, dev, build, start, test, add, feat.
---

## bosia create

Scaffold a new Bosia project.

```bash
bosia create <name> [--template <template>]
```

| Option       | Description                                   |
| ------------ | --------------------------------------------- |
| `<name>`     | Project directory name                        |
| `--template` | Skip the picker: `default`, `demo`, or `todo` |

**Templates:**

- **default** — Minimal starter with home page, about page, and one server loader
- **demo** — Full-featured example with blog, API routes, form actions, hooks, and catch-all routes
- **todo** — Todo app with PostgreSQL + Drizzle ORM (auto-installs `drizzle` and `todo` features)

After scaffolding, `bun install` runs automatically.

## bosia dev

Start the development server with hot reload.

```bash
bosia dev
```

- Dev server runs at **http://localhost:9000**
- File changes trigger automatic browser reload via SSE
- Uses a proxy architecture: dev proxy on `:9000`, app server on `:9001`
- **Auto-restart on crash** — if the app process exits unexpectedly, it restarts automatically. After 3 rapid crashes within 5 seconds, it stops retrying and waits for a file change.

## bosia build

Build the project for production.

```bash
bosia build
```

This runs:

1. Route scanning and manifest generation
2. Type generation (`$types.d.ts` files)
3. Environment variable module generation (`$env`)
4. Client bundle (JavaScript + CSS via Tailwind)
5. Server entry bundle
6. Static prerendering (routes with `export const prerender = true`)

Output goes to `dist/`.

## bosia start

Run the production server.

```bash
bosia start
```

Runs the built server from `dist/`. Requires `bosia build` to have been run first.

## bosia test

Run tests with `bun test`, framework-aware.

```bash
bosia test [args]
```

- Auto-loads `.env`, `.env.local`, `.env.test`, `.env.test.local` (later files override earlier; system env wins)
- Sets `BOSIA_ENV=test` and `NODE_ENV=test` (only if not already set)
- Forwards `NODE_PATH` so framework dependencies resolve in tests
- Passes all flags through to `bun test` (`--watch`, `--coverage`, `--bail`, `--timeout`, file/dir filters)
- Forwards Bun's exit code

Examples:

```bash
bosia test
bosia test --watch
bosia test --coverage
bosia test src/lib/foo.test.ts
```

Place test files anywhere Bun discovers them (default: `*.test.ts` / `*.test.tsx` / `*.spec.ts` / files inside `__tests__/`).

## bosia add

Install one or more UI components from the registry.

```bash
bun x bosia@latest add <component...> [-y] [--local]
```

- Accepts **multiple component names** in a single call — installs each (and its dependencies) in order
- Downloads component files to `src/lib/components/ui/<component>/`
- Supports **path-based names** — `bun x bosia@latest add shop/cart` installs to `src/lib/components/shop/cart/`
- Components without a path prefix default to `ui/` — `bun x bosia@latest add button` → `src/lib/components/ui/button/`
- If a component already exists, prompts to **replace** or **skip**
- `-y`, `--yes` — auto-confirm overwrites without prompting (for CI / scripts)
- Automatically installs component dependencies (other components it depends on)
- Installs required npm packages via `bun add`
- Registry hosted on GitHub: `bosapi/bosia/main/registry/components/`

Example:

```bash
bun x bosia@latest add button              # → src/lib/components/ui/button/
bun x bosia@latest add card                # → src/lib/components/ui/card/
bun x bosia@latest add button card input   # install multiple at once
bun x bosia@latest add -y button card      # auto-confirm overwrites
bun x bosia@latest add shop/cart           # → src/lib/components/shop/cart/
bun x bosia@latest add dashboard/widgets   # → src/lib/components/dashboard/widgets/
```

## bosia feat

Scaffold a feature (routes + components + server files).

```bash
bosia feat <feature>
```

- Installs required UI components first via `bosia add`
- Copies feature files to the appropriate locations in your project
- Installs required npm packages
- Registry hosted on GitHub: `bosapi/bosia/main/registry/features/`

Example:

```bash
bosia feat login
```
