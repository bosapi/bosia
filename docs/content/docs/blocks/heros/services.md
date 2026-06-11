---
title: Heros — Services
description: Agency and consulting hero sections for service businesses.
demo: HerosServicesDemo
---

Two service heroes — a bold dark agency hero with a glow accent and client logos, and a B2B
consulting split hero with bullet points and result stats. The brand colour maps to `--primary`,
so the glow, highlighted word, and CTAs follow the active theme.

## Preview

## Install

```bash
bun x bosia@latest add block heros/agency
bun x bosia@latest add block heros/consulting
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Agency from "$lib/blocks/heros/agency/block.svelte";
</script>

<Agency />
```

Heroes are full-width `<section>` blocks. Edit `block.svelte` to swap copy, logos, stats, and
the Unsplash image.
