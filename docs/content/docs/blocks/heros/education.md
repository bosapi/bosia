---
title: Heros — Education
description: Course-landing and campus admissions hero sections.
demo: HerosEducationDemo
---

Two education heroes — a split course-landing layout with enrollment stats and a live-lesson
card, and a centered full-bleed campus admissions hero. The brand colour maps to `--primary`, so
the highlighted headline word and CTAs follow the active theme.

## Preview

## Install

```bash
bun x bosia@latest add block heros/course
bun x bosia@latest add block heros/campus
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Course from "$lib/blocks/heros/course/block.svelte";
</script>

<Course />
```

Heroes are full-width `<section>` blocks. Edit `block.svelte` to swap copy, stats, and the
Unsplash images.
