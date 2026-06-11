---
title: Cards — People
description: Profile, contact, and testimonial cards for people and social UIs.
demo: CardsPeopleDemo
---

Cards for people — profiles, contacts, and testimonials. The brand colour maps to `--primary`,
so avatars, follow buttons, and accents follow the active theme.

## Preview

## Install

Each card installs on its own:

```bash
bun x bosia@latest add block cards/profile
bun x bosia@latest add block cards/contact
bun x bosia@latest add block cards/testimonial
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Profile from "$lib/blocks/cards/profile/block.svelte";
</script>

<Profile />
```

The follow toggle on the profile card is cosmetic local `$state` — replace it with your own
handler.
