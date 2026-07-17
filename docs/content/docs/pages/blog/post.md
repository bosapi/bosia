---
title: Pages — Blog Post
description: A blog post page composed from blocks — navbar, post header, prose body, related row and footer.
demo: PagesBlogPostDemo
---

A complete blog post page: a minimal navbar, the post header, a 70ch prose body, a related-posts
row and a minimal footer. Every block is theme-aware — try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add page blog/post
```

Installs `page.svelte` plus every block it composes.

## Usage

```svelte
<script lang="ts">
	import Post from "$lib/pages/blog/post/page.svelte";
</script>

<Post />
```

Without props the page renders the sample post baked into the blocks. To serve real content,
install the [`blog` feature](/guides/blog/) — its loader for `/blog/[slug]` returns `post` and
`related` in exactly the shape the page accepts:

```svelte
<script lang="ts">
	import Post from "$lib/pages/blog/post/page.svelte";

	let { data } = $props();
</script>

<Post post={data.post} bodyHtml={data.post.body} related={data.related} />
```

`bodyHtml` is rendered unescaped by `blog/post-body` — only pass trusted content (your own
database), never user input.

## Source

`src/lib/pages/blog/post/page.svelte`
