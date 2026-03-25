# {{PROJECT_NAME}}

A [Bosbun](https://github.com/nicholascostadev/bosbun) project with demo routes, hooks, API endpoints, and form actions.

## Running

```bash
bun x bosbun dev     # http://localhost:9000
bun x bosbun build   # production build
bun x bosbun start   # run production server
```

## Routes

| URL | File | Description |
|-----|------|-------------|
| `/` | `(public)/+page.svelte` | Home page |
| `/about` | `(public)/about/+page.svelte` | About page |
| `/blog` | `(public)/blog/+page.svelte` | Blog listing |
| `/blog/:slug` | `(public)/blog/[slug]/+page.svelte` | Blog post — fetched via server loader |
| `/api/hello` | `api/hello/+server.ts` | Multi-method JSON API |
| `/actions-test` | `actions-test/+page.svelte` | Form actions demo |
| `/*` | `(public)/[...catchall]/+page.svelte` | 404 catch-all |

## Learn More

- [Bosbun documentation](https://bosapi.github.io/bosbun)
- [Svelte 5 docs](https://svelte.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
