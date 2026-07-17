---
title: Pages — Errors
description: Standalone 404, 500 and maintenance pages — no blocks, no dependencies, one file each.
demo: PagesErrorsDemo
---

Three standalone error screens: a 404, a 500 and a maintenance page. Unlike other pages they
compose no blocks — each is a single self-contained `page.svelte` with zero dependencies, so they
keep working even when the rest of the app is having a bad day.

## Preview

## Install

```bash
bun x bosia@latest add page errors/not-found
bun x bosia@latest add page errors/server-error
bun x bosia@latest add page errors/maintenance
```

## The pages

- **`not-found`** — big 404, short message, back-to-home link. Wire it into your error route for
  404 statuses.
- **`server-error`** — 500 with a reload button and a home link.
- **`maintenance`** — "we'll be right back" screen; pass `contactEmail` to show an urgent-contact
  line.

## Usage

```svelte
<script lang="ts">
	import NotFound from "$lib/pages/errors/not-found/page.svelte";
</script>

<NotFound />
```

All copy is overridable via props (`code`, `title`, `message`, `homeHref`, `homeLabel`). In a
Bosia app, render `not-found` / `server-error` from your error boundary based on the status, and
serve `maintenance` from a catch-all route while you deploy.

## Source

`src/lib/pages/errors/*/page.svelte`
