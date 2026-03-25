# Bosbun

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

## Documentation

Full documentation available at [bosapi.github.io/bosbun](https://bosapi.github.io/bosbun).

- [Getting Started](docs/src/content/docs/getting-started.md)
- [Project Structure](docs/src/content/docs/project-structure.md)
- [Routing](docs/src/content/docs/guides/routing.md)
- [Server Loaders](docs/src/content/docs/guides/server-loaders.md)
- [API Routes](docs/src/content/docs/guides/api-routes.md)
- [Form Actions](docs/src/content/docs/guides/form-actions.md)
- [Middleware Hooks](docs/src/content/docs/guides/middleware-hooks.md)
- [Environment Variables](docs/src/content/docs/guides/environment-variables.md)
- [Styling](docs/src/content/docs/guides/styling.md)
- [Security](docs/src/content/docs/guides/security.md)
- [CLI Reference](docs/src/content/docs/reference/cli.md)
- [API Reference](docs/src/content/docs/reference/api.md)
- [Deployment](docs/src/content/docs/reference/deployment.md)
- [SvelteKit Differences](docs/src/content/docs/reference/sveltekit-differences.md)

## Monorepo Structure

```
bosbun/
├── apps/
│   └── demo/          # Example app showing routing, loaders, API, hooks
└── packages/
    └── bosbun/         # Framework package (CLI + core + templates)
```

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

See [Getting Started](docs/src/content/docs/getting-started.md) for a full walkthrough.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | [Bun](https://bun.sh) |
| HTTP Server | [ElysiaJS](https://elysiajs.com) |
| UI | [Svelte 5](https://svelte.dev) (Runes) |
| CSS | [Tailwind CSS v4](https://tailwindcss.com) |
| Bundler | Bun.build |

## Monorepo Development

```bash
# Install all workspace dependencies
bun install

# Run the demo app in dev mode
cd apps/demo
bun run dev
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for what's done, what's next, and the full plan toward production readiness.

## License

MIT
