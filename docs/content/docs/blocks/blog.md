---
title: Blog Sections
description: Blog sections — post-list cards, a post header, a prose body wrapper and a related-posts row.
demo: BlogSectionsDemo
---

Blog sections for a content site. Each is a self-contained, full-width Svelte `<section>` built
**only** from semantic tokens, so it restyles across every theme. Try the theme switcher above the
preview.

## Preview

## Install

```bash
bun x bosia@latest add block blog/post-list
bun x bosia@latest add block blog/post-header
bun x bosia@latest add block blog/post-body
bun x bosia@latest add block blog/related
```

`post-body` pulls [`ui/typography`](/components/ui/typography/) for its prose styles.

## The blocks

- **`post-list`** — heading and intro over a vertical stack of post cards (tag, date, title, excerpt).
- **`post-header`** — tag, date, title, excerpt, author byline with reading time and a cover image.
- **`post-body`** — a 70ch prose article; pass an `html` string, a children snippet, or keep the sample prose.
- **`related`** — a "keep reading" row of up to three compact post cards.

## Usage

```svelte
<script lang="ts">
	import PostList from "$lib/blocks/blog/post-list/block.svelte";
</script>

<PostList />
```

Every block ships with sample posts so it renders standalone. To feed real data, pass props:
`post-list` and `related` take `posts` (array of `{ slug, title, excerpt, tag, date, datetime }`),
`post-header` takes the post fields directly, and `post-body` takes `html`. Post links go to
`{base}/{slug}` — `base` defaults to `/blog`. Install the [`blog` feature](/guides/blog/) for a
database-backed posts table with server loaders that produce exactly this shape.

`post-body` renders `html` unescaped — only pass trusted content (your own database), never user
input.

## Source

`src/lib/blocks/blog/*/block.svelte`
