---
title: Pages — Storefront Search
description: Search results page with a command-palette overlay, sortable grid and a no-results state.
demo: PagesSearchDemo
---

The Mercato search page: the header's search icon opens a command-palette overlay with
autocomplete; picking a result or submitting free text filters a sortable product grid, and a
no-results empty state offers to clear the search.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/search
```

Installs `page.svelte` plus the storefront blocks it composes.

## Usage

```svelte
<script lang="ts">
	import Search from "$lib/pages/storefront/search/page.svelte";
</script>

<Search />
```

A query is seeded on first visit so results show immediately. The overlay matches product names and
categories with keyboard navigation (↑ ↓ Enter Esc); Enter with free text runs it as the page
query. Wire `onSubmit` to your real search endpoint when you have one.

## Source

`src/lib/pages/storefront/search/page.svelte`
