---
title: Breadcrumb
description: Menampilkan jalur ke resource saat ini memakai hierarki tautan.
demo: BreadcrumbDemo
---

```bash
bun x bosia@latest add breadcrumb
```

Komponen navigasi yang komposabel dan semantik, dibangun dengan `<nav aria-label="breadcrumb">`, list `<ol>`, dan item `<li>` individual. Tanpa state — murni markup dan styling.

## Preview

## Props Breadcrumb

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<nav>` dengan `aria-label="breadcrumb"`.

## Props BreadcrumbList

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<ol>` dengan layout flex dan teks muted foreground.

## Props BreadcrumbItem

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<li>` dengan layout inline-flex.

## Props BreadcrumbLink

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `href`  | `string` | `"#"`   |
| `class` | `string` | `""`    |

Merender `<a>` dengan transisi warna saat hover.

## Props BreadcrumbPage

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<span>` yang mewakili halaman saat ini dengan `role="link"`, `aria-disabled="true"`, dan `aria-current="page"`.

## Props BreadcrumbSeparator

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<li>` dengan `role="presentation"` dan `aria-hidden="true"`. Default ke ikon chevron-right; berikan children untuk menyesuaikan.

## Props BreadcrumbEllipsis

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender indikator yang diciutkan dengan ikon elipsis horizontal dan teks "More" `sr-only`.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbPage,
		BreadcrumbSeparator,
	} from "$lib/components/ui/breadcrumb";
</script>

<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="/">Home</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="/components">Components</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
```

## Diciutkan dengan Elipsis

Gunakan `BreadcrumbEllipsis` untuk menciutkan segmen tengah pada hierarki yang dalam:

```svelte
<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="/">Home</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbEllipsis />
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="/components/ui">UI</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
```

## Separator Kustom

Berikan children ke `BreadcrumbSeparator` untuk menimpa chevron default:

```svelte
<BreadcrumbSeparator>/</BreadcrumbSeparator>
```
