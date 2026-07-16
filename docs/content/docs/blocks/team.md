---
title: Team Sections
description: Team sections — a member-card grid and a founder spotlight with quote and bio.
demo: TeamSectionsDemo
---

Team sections for an about or company page. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme. Try the theme
switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block team/grid
bun x bosia@latest add block team/spotlight
```

`spotlight` pulls [`@lucide/svelte`](/components/ui/icon/) for its story-link arrow.

## The blocks

- **`grid`** — member cards in a responsive grid: avatar, name, role and social text links.
- **`spotlight`** — one oversized founder/leadership card: portrait beside a quote, bio and link.

## Usage

```svelte
<script lang="ts">
	import Team from "$lib/blocks/team/grid/block.svelte";
</script>

<Team />
```

Members live in a hardcoded array at the top of `grid/block.svelte` — edit names, roles and
avatar URLs there. The placeholder portraits come from `i.pravatar.cc`; swap them for your own
images before shipping.

## Source

`src/lib/blocks/team/*/block.svelte`
