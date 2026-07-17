---
title: Blog
description: A blog backend — a Drizzle posts table with server loaders for /blog and /blog/[slug], plus a sample seed.
---

The `blog` feature gives you the backend for the [blog blocks](/docs/blocks/blog) and
[blog pages](/pages/blog/index): a `posts` table, a repository and service, server loaders for
`/blog` and `/blog/[slug]`, and a seed with three sample posts.

## Install

```bash
bun x bosia@latest feat blog                  # prompts for DB dialect
bun x bosia@latest feat -y blog               # auto: sqlite default
bun x bosia@latest feat blog -d postgres      # explicit
```

The CLI installs the `drizzle` feature on first use. After install:

```bash
bun run db:generate
bun run db:migrate
bun run db:seed        # optional — three sample posts, skipped if posts exist
```

## What you get

| Path                                       | Purpose                                         |
| ------------------------------------------ | ----------------------------------------------- |
| `src/features/blog/schemas/posts.table.ts` | Drizzle table (matches your dialect)            |
| `src/features/blog/post.repository.ts`     | DB queries (published, by slug, related)        |
| `src/features/blog/blog.service.ts`        | Maps rows to block-ready shape                  |
| `src/routes/blog/+page.server.ts`          | Loader: `{ posts }`                             |
| `src/routes/blog/[slug]/+page.server.ts`   | Loader: `{ post, related }`, 404s unknown slugs |
| `src/features/drizzle/seeds/003_blog.ts`   | Sample posts seed                               |

## Wire the pages

```bash
bun x bosia@latest add page blog/index
bun x bosia@latest add page blog/post
```

Then create the route views next to the installed loaders:

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
	import Blog from "$lib/pages/blog/index/page.svelte";

	let { data } = $props();
</script>

<Blog posts={data.posts} />
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
	import Post from "$lib/pages/blog/post/page.svelte";

	let { data } = $props();
</script>

<Post post={data.post} bodyHtml={data.post.body} related={data.related} />
```

## The posts table

`slug` (unique), `title`, `excerpt`, `body`, `cover`, `tag` and `published_at`. A post with
`published_at = NULL` is a draft — loaders and lists only ever return published posts.

`body` is stored as HTML and rendered unescaped by `blog/post-body` — only put trusted content in
it, never user input.

There is no writing UI: insert posts with a seed, a script or your own admin page on top of
`PostRepository`.
