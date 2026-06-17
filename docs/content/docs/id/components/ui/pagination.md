---
title: Pagination
description: Paginasi dengan navigasi halaman, tautan berikutnya dan sebelumnya.
demo: PaginationDemo
---

```bash
bun x bosia@latest add pagination
```

Komponen paginasi yang komposabel dan tanpa state. Parent memegang state halaman saat ini — komponen ini hanya merender markup `<nav>`, `<ul>`, dan `<li>` semantik dengan tautan bergaya button.

## Preview

## Props Pagination

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<nav role="navigation" aria-label="pagination">` dengan `mx-auto flex w-full justify-center`.

## Props PaginationContent

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<ul>` dengan `flex flex-row items-center gap-1`.

## Props PaginationItem

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<li>`. Wrapper pass-through.

## Props PaginationLink

| Prop       | Type                                  | Default  |
| ---------- | ------------------------------------- | -------- |
| `href`     | `string`                              | `"#"`    |
| `isActive` | `boolean`                             | `false`  |
| `disabled` | `boolean`                             | `false`  |
| `size`     | `"default" \| "sm" \| "lg" \| "icon"` | `"icon"` |
| `class`    | `string`                              | `""`     |

Merender `<a>` bergaya button. Saat `isActive` `true`, menerapkan `aria-current="page"` dan styling outline; selain itu styling ghost. Saat `disabled` `true`, menerapkan `aria-disabled="true"`, `tabindex="-1"`, `pointer-events-none`, dan `opacity-50`.

## Props PaginationPrevious

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `href`     | `string`  | `"#"`   |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

Merender `PaginationLink` dengan ikon chevron-left dan label "Previous". Termasuk `aria-label="Go to previous page"`. Berikan `disabled` saat di halaman pertama.

## Props PaginationNext

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `href`     | `string`  | `"#"`   |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

Merender `PaginationLink` dengan label "Next" dan ikon chevron-right. Termasuk `aria-label="Go to next page"`. Berikan `disabled` saat di halaman terakhir.

## Props PaginationEllipsis

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<span aria-hidden="true">` dengan ikon elipsis horizontal dan teks "More pages" `sr-only`.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Pagination,
		PaginationContent,
		PaginationItem,
		PaginationLink,
		PaginationPrevious,
		PaginationNext,
		PaginationEllipsis,
	} from "$lib/components/ui/pagination";

	let currentPage = $state(1);
</script>

<Pagination>
	<PaginationContent>
		<PaginationItem>
			<PaginationPrevious href="#" />
		</PaginationItem>
		<PaginationItem>
			<PaginationLink href="#" isActive={currentPage === 1}>1</PaginationLink>
		</PaginationItem>
		<PaginationItem>
			<PaginationLink href="#">2</PaginationLink>
		</PaginationItem>
		<PaginationItem>
			<PaginationLink href="#">3</PaginationLink>
		</PaginationItem>
		<PaginationItem>
			<PaginationEllipsis />
		</PaginationItem>
		<PaginationItem>
			<PaginationNext href="#" />
		</PaginationItem>
	</PaginationContent>
</Pagination>
```

Komponen ini tanpa state — parent memegang halaman saat ini. Berikan `isActive` pada `PaginationLink` untuk halaman saat ini; ia otomatis mendapat `aria-current="page"`.
