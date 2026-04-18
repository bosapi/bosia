---
title: Item
description: A versatile flex container for displaying content with media, title, description, and actions.
demo: ItemDemo
---

```bash
bosia add item
```

A compound layout component with composable sub-components: `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemHeader`, `ItemFooter`, `ItemGroup`, and `ItemSeparator`.

## Preview

## Props

### Item

| Prop      | Type                                  | Default     |
| --------- | ------------------------------------- | ----------- |
| `variant` | `"default" \| "outline" \| "muted"`  | `"default"` |
| `size`    | `"default" \| "sm"`                   | `"default"` |
| `class`   | `string`                              | `""`        |

### ItemMedia

| Prop      | Type                                  | Default     |
| --------- | ------------------------------------- | ----------- |
| `variant` | `"default" \| "icon" \| "image"`     | `"default"` |
| `class`   | `string`                              | `""`        |

All other sub-components accept `class` and `...restProps` only.

## Usage

```svelte
<script lang="ts">
  import {
    Item, ItemMedia, ItemContent,
    ItemTitle, ItemDescription, ItemActions
  } from "$lib/components/ui/item";
  import { Button } from "$lib/components/ui/button";
</script>

<Item>
  <ItemMedia variant="icon">
    <!-- icon or avatar -->
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Title</ItemTitle>
    <ItemDescription>Description text</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="outline" size="sm">Action</Button>
  </ItemActions>
</Item>
```

## Variants

### Outline

```svelte
<Item variant="outline">
  <ItemContent>
    <ItemTitle>Outlined item</ItemTitle>
  </ItemContent>
</Item>
```

### Muted

```svelte
<Item variant="muted">
  <ItemContent>
    <ItemTitle>Muted item</ItemTitle>
  </ItemContent>
</Item>
```

## Item Group

Use `ItemGroup` and `ItemSeparator` to create lists:

```svelte
<ItemGroup>
  <Item>
    <ItemContent>
      <ItemTitle>First item</ItemTitle>
    </ItemContent>
  </Item>
  <ItemSeparator />
  <Item>
    <ItemContent>
      <ItemTitle>Second item</ItemTitle>
    </ItemContent>
  </Item>
</ItemGroup>
```

## Polymorphic Rendering

Use the `child` snippet to render as a different element (e.g., `<a>`):

```svelte
<Item>
  {#snippet child({ class: cls, props })}
    <a href="/page" class={cls} {...props}>
      <ItemContent>
        <ItemTitle>Link item</ItemTitle>
      </ItemContent>
    </a>
  {/snippet}
</Item>
```
