---
title: Heros — Course
description: Course-landing hero with enrollment stats and a live-lesson card.
demo: HeroCourseDemo
---

```bash
bun x bosia@latest add block heros/course
```

Course-landing hero with enrollment stats and a live-lesson card. A self-contained, full-width `<section>` built from semantic tokens only, so it restyles across all 18 themes — the brand colour maps to `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/course
```

Pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Course from "$lib/blocks/heros/course/block.svelte";
</script>

<Course />
```

Drop it at the top of a route. Any interactive bits (size / color / age pickers, address or email inputs) are cosmetic local `$state` — wire them to your own data. Edit `block.svelte` to swap copy and the Unsplash images.

## Source

`src/lib/blocks/heros/course/block.svelte`
