---
title: Pages — Blog Index
description: A blog index page composed from blocks — navbar, post-list cards and footer.
demo: PagesBlogIndexDemo
---

A complete blog index: a minimal navbar, the post-list card stack and a minimal footer. Every
block is theme-aware — try the theme switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add page blog/index
```

Installs `page.svelte` plus every block it composes.

## Usage

```svelte
<script lang="ts">
	import Blog from "$lib/pages/blog/index/page.svelte";
</script>

<Blog />
```

Without props the page renders the sample posts baked into `blog/post-list`. To serve real
content, install the [`blog` feature](/guides/blog/) — its loader for `/blog` returns `posts` in
exactly the shape the page accepts:

```svelte
<script lang="ts">
	import Blog from "$lib/pages/blog/index/page.svelte";

	let { data } = $props();
</script>

<Blog posts={data.posts} />
```

Edit the individual blocks under `src/lib/blocks/` to change copy, or swap the navbar and footer
for any other `navbars/*` / `footers/*` block.

## Source

`src/lib/pages/blog/index/page.svelte`
