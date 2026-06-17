---
title: Typography
description: Komponen tipografi semantik dengan kelas Tailwind yang sudah ber-style.
demo: TypographyDemo
---

```bash
bun x bosia@latest add typography
```

Wrapper tipis di sekitar elemen HTML semantik dengan styling Tailwind yang konsisten. Impor komponen individual alih-alih menghafal string kelas.

## Preview

## Props

Semua komponen tipografi berbagi prop yang sama:

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Semua komponen juga menyebarkan `...restProps` ke elemen root-nya.

## Komponen

| Komponen               | Elemen         | Deskripsi          |
| ---------------------- | -------------- | ------------------ |
| `TypographyH1`         | `<h1>`         | Heading halaman    |
| `TypographyH2`         | `<h2>`         | Heading bagian     |
| `TypographyH3`         | `<h3>`         | Heading sub-bagian |
| `TypographyH4`         | `<h4>`         | Heading minor      |
| `TypographyP`          | `<p>`          | Paragraf           |
| `TypographyBlockquote` | `<blockquote>` | Kutipan blok       |
| `TypographyList`       | `<ul>`         | List tak berurut   |
| `TypographyInlineCode` | `<code>`       | Kode inline        |
| `TypographyLead`       | `<p>`          | Paragraf lead      |
| `TypographyLarge`      | `<div>`        | Teks besar         |
| `TypographySmall`      | `<small>`      | Teks kecil         |
| `TypographyMuted`      | `<p>`          | Teks muted         |

## Penggunaan

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
	Use <TypographyInlineCode>bun x bosia@latest add typography</TypographyInlineCode> to install.
</TypographyP>
<TypographyMuted>Last updated today.</TypographyMuted>
```
