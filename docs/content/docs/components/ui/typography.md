---
title: Typography
description: Semantic typography components with pre-styled Tailwind classes.
demo: TypographyDemo
---

```bash
bosia add typography
```

Thin wrappers around semantic HTML elements with consistent Tailwind styling. Import individual components instead of memorizing class strings.

## Preview

## Props

All typography components share the same props:

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

All components also spread `...restProps` onto their root element.

## Components

| Component              | Element        | Description         |
| ---------------------- | -------------- | ------------------- |
| `TypographyH1`         | `<h1>`         | Page heading        |
| `TypographyH2`         | `<h2>`         | Section heading     |
| `TypographyH3`         | `<h3>`         | Sub-section heading |
| `TypographyH4`         | `<h4>`         | Minor heading       |
| `TypographyP`          | `<p>`          | Paragraph           |
| `TypographyBlockquote` | `<blockquote>` | Block quote         |
| `TypographyList`       | `<ul>`         | Unordered list      |
| `TypographyInlineCode` | `<code>`       | Inline code         |
| `TypographyLead`       | `<p>`          | Lead paragraph      |
| `TypographyLarge`      | `<div>`        | Large text          |
| `TypographySmall`      | `<small>`      | Small text          |
| `TypographyMuted`      | `<p>`          | Muted text          |

## Usage

```svelte
<script lang="ts">
	import {
		TypographyH1,
		TypographyP,
		TypographyLead,
		TypographyInlineCode,
		TypographyMuted,
	} from "$lib/components/ui/typography";
</script>

<TypographyH1>My Page Title</TypographyH1>
<TypographyLead>A brief introduction to the page.</TypographyLead>
<TypographyP>
	Use <TypographyInlineCode>bosia add typography</TypographyInlineCode> to install.
</TypographyP>
<TypographyMuted>Last updated today.</TypographyMuted>
```
