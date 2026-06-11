---
title: Heros — Bookstore
description: Bookstore hero with fanned covers and a floating staff-pick card.
demo: HeroBookstoreDemo
---

```bash
bun x bosia@latest add block heros/bookstore
```

Bookstore hero with fanned covers and a floating staff-pick card. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/bookstore
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Bookstore from "$lib/blocks/heros/bookstore/block.svelte";
</script>

<Bookstore />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/bookstore/block.svelte`
