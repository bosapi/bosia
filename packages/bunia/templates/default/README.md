# {{PROJECT_NAME}}

A [Bunia](https://github.com/bosapi/bunia) project — SSR · Svelte 5 · Bun · ElysiaJS.

## Getting Started

```bash
bun run dev     # start development server at http://localhost:3000
bun run build   # build for production
bun run start   # run the production server
```

## Project Structure

```
src/
├── app.css              # Global styles and Tailwind design tokens
├── hooks.server.ts      # Optional request middleware (auth, logging)
├── lib/                 # Shared utilities — import via $lib
└── routes/              # Pages and API endpoints
    ├── +layout.svelte   # Root layout
    └── +page.svelte     # Home page (/)
public/                  # Static assets
```

## Routes

Add pages by creating `+page.svelte` files under `src/routes/`:

```
src/routes/
├── +page.svelte              # /
├── about/
│   └── +page.svelte          # /about
└── blog/
    ├── +page.svelte          # /blog
    └── [slug]/
        ├── +page.server.ts   # server loader
        └── +page.svelte      # /blog/:slug
```

### Server Loaders

Fetch data on the server before rendering:

```typescript
// src/routes/blog/[slug]/+page.server.ts
import type { LoadEvent } from "bunia";

export async function load({ params }: LoadEvent) {
    return { post: await getPost(params.slug) };
}
```

### API Endpoints

```typescript
// src/routes/api/hello/+server.ts
export function GET() {
    return Response.json({ message: "hello" });
}
```

### Route Groups

Group routes under a shared layout without changing the URL:

```
src/routes/
└── (app)/
    ├── +layout.svelte   # shared layout for the group
    └── dashboard/
        └── +page.svelte  # /dashboard
```

## Styling

`src/app.css` imports Tailwind v4 and defines shadcn-inspired design tokens. Use the semantic color classes anywhere:

```svelte
<div class="bg-background text-foreground">
  <p class="text-muted-foreground">Muted text</p>
  <button class="bg-primary text-primary-foreground">Click</button>
</div>
```

Dark mode is supported via the `.dark` class on any parent element.

## Utilities

```typescript
import { cn } from "$lib/utils";

// Merges Tailwind classes safely
cn("px-4 py-2", isActive && "bg-primary")
```

## Learn More

- [Bunia documentation](https://github.com/bosapi/bunia)
- [Svelte 5 docs](https://svelte.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
