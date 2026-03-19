# Bunia

A minimalist fullstack framework — SSR · Svelte 5 Runes · Bun · ElysiaJS.

File-based routing inspired by SvelteKit, built on top of the Bun runtime and ElysiaJS HTTP server. No Node.js, no Vite, no adapters.

## Features

- **File-based routing** — `+page.svelte`, `+layout.svelte`, `+server.ts`, route groups, dynamic segments, catch-all routes
- **Server-side rendering** — every page is rendered on the server with full hydration
- **Server loaders** — `+page.server.ts` and `+layout.server.ts` with `parent()` data threading
- **API routes** — `+server.ts` exports HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`)
- **Middleware hooks** — `hooks.server.ts` with `sequence()` for auth, logging, locals
- **Dev server with HMR** — file watcher + SSE browser reload, no page blink
- **Tailwind CSS v4** — compiled at build time, shadcn-inspired design tokens out of the box
- **CLI** — `bunia create`, `bunia dev`, `bunia build`, `bunia add`, `bunia feat`

## Monorepo Structure

```
bunia/
├── apps/
│   └── demo/          # Example app showing routing, loaders, API, hooks
└── packages/
    └── bunia/         # Framework package (CLI + core + templates)
```

## Quick Start

```bash
# Scaffold a new project
bunx bunia create my-app
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

## Monorepo Development

```bash
# Install all workspace dependencies
bun install

# Run the demo app in dev mode
cd apps/demo
bun run dev
```

## License

MIT
