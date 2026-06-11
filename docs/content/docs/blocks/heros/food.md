---
title: Heros — Food
description: Restaurant reservation and food-delivery hero sections.
demo: HerosFoodDemo
---

Two food heroes — a full-bleed restaurant hero with a reservation CTA and venue meta, and a
food-delivery hero with an address search bar and floating dish cards. The brand colour maps to
`--primary`, so the highlighted word, CTAs, and badges follow the active theme.

## Preview

## Install

```bash
bun x bosia@latest add block heros/restaurant
bun x bosia@latest add block heros/delivery
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Delivery from "$lib/blocks/heros/delivery/block.svelte";
</script>

<Delivery />
```

Heroes are full-width `<section>` blocks. The delivery address field is a cosmetic local
`$state` — wire it to your own search. Edit `block.svelte` to swap copy and the Unsplash images.
