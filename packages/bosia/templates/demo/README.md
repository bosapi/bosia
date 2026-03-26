# {{PROJECT_NAME}}

A [Bosia](https://github.com/nicholascostadev/bosia) project with demo routes, hooks, API endpoints, and form actions.

## Running

```bash
bun x bosia dev     # http://localhost:9000
bun x bosia build   # production build
bun x bosia start   # run production server
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

- [Bosia documentation](https://bosia.bosapi.com)
- [Svelte 5 docs](https://svelte.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
