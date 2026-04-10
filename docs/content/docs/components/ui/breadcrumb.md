---
title: Breadcrumb
description: Displays the path to the current resource using a hierarchy of links.
demo: BreadcrumbDemo
---

```bash
bosia add breadcrumb
```

A composable, semantic navigation component built with `<nav aria-label="breadcrumb">`, an `<ol>` list, and individual `<li>` items. Stateless — purely markup and styling.

## Preview

## Breadcrumb Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<nav>` with `aria-label="breadcrumb"`.

## BreadcrumbList Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders an `<ol>` with flex layout and muted foreground text.

## BreadcrumbItem Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders an `<li>` with inline-flex layout.

## BreadcrumbLink Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `href`  | `string` | `"#"`   |
| `class` | `string` | `""`    |

Renders an `<a>` with hover color transition.

## BreadcrumbPage Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<span>` representing the current page with `role="link"`, `aria-disabled="true"`, and `aria-current="page"`.

## BreadcrumbSeparator Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders an `<li>` with `role="presentation"` and `aria-hidden="true"`. Defaults to a chevron-right icon; pass children to customize.

## BreadcrumbEllipsis Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a collapsed indicator with a horizontal ellipsis icon and `sr-only` "More" text.

## Usage

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

## Collapsed with Ellipsis

Use `BreadcrumbEllipsis` to collapse middle segments of deep hierarchies:

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

## Custom Separator

Pass children to `BreadcrumbSeparator` to override the default chevron:

```svelte
<BreadcrumbSeparator>/</BreadcrumbSeparator>
```
