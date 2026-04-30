---
title: Pagination
description: Pagination with page navigation, next and previous links.
demo: PaginationDemo
---

```bash
bosia add pagination
```

A composable, stateless pagination component. The parent owns the current page state — this component only renders semantic `<nav>`, `<ul>`, and `<li>` markup with button-styled links.

## Preview

## Pagination Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<nav role="navigation" aria-label="pagination">` with `mx-auto flex w-full justify-center`.

## PaginationContent Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<ul>` with `flex flex-row items-center gap-1`.

## PaginationItem Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<li>`. Pass through wrapper.

## PaginationLink Props

| Prop       | Type                                  | Default  |
| ---------- | ------------------------------------- | -------- |
| `href`     | `string`                              | `"#"`    |
| `isActive` | `boolean`                             | `false`  |
| `disabled` | `boolean`                             | `false`  |
| `size`     | `"default" \| "sm" \| "lg" \| "icon"` | `"icon"` |
| `class`    | `string`                              | `""`     |

Renders an `<a>` styled as a button. When `isActive` is `true`, applies `aria-current="page"` and outline styling; otherwise ghost styling. When `disabled` is `true`, applies `aria-disabled="true"`, `tabindex="-1"`, `pointer-events-none`, and `opacity-50`.

## PaginationPrevious Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `href`     | `string`  | `"#"`   |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

Renders a `PaginationLink` with a chevron-left icon and "Previous" label. Includes `aria-label="Go to previous page"`. Pass `disabled` when on the first page.

## PaginationNext Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `href`     | `string`  | `"#"`   |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

Renders a `PaginationLink` with a "Next" label and chevron-right icon. Includes `aria-label="Go to next page"`. Pass `disabled` when on the last page.

## PaginationEllipsis Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<span aria-hidden="true">` with a horizontal ellipsis icon and `sr-only` "More pages" text.

## Usage

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

The component is stateless — the parent owns the current page. Pass `isActive` on the `PaginationLink` for the current page; it will get `aria-current="page"` automatically.
