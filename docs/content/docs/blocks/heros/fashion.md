---
title: Heros — Fashion
description: Editorial lookbook and new-drop product hero sections.
demo: HerosFashionDemo
---

Two fashion heroes — a full-bleed editorial lookbook over a photo and a new-drop product hero
with a size selector. The brand colour maps to `--primary`, so the CTAs and badges follow the
active theme.

## Preview

## Install

```bash
bun x bosia@latest add block heros/lookbook
bun x bosia@latest add block heros/new-drop
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Lookbook from "$lib/blocks/heros/lookbook/block.svelte";
</script>

<Lookbook />
```

Heroes are full-width `<section>` blocks. The `new-drop` size picker is a cosmetic local
`$state`. Edit `block.svelte` to swap copy and the Unsplash images.
