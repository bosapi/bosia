---
title: Heros — SaaS
description: App and product-launch hero sections for software products.
demo: HerosSaasDemo
---

Two SaaS heroes — a split app hero with a feature list and phone mockup, and a centered
product-launch hero with email capture and a browser mockup. The brand colour maps to
`--primary`, so the highlighted word, CTAs, and badges follow the active theme.

## Preview

## Install

```bash
bun x bosia@latest add block heros/app
bun x bosia@latest add block heros/product
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import App from "$lib/blocks/heros/app/block.svelte";
</script>

<App />
```

Heroes are full-width `<section>` blocks. The email capture on `product` is a cosmetic local
`$state` — wire it to your own handler. Edit `block.svelte` to swap copy and the Unsplash image.
