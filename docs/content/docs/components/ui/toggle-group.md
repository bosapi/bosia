---
title: Toggle Group
description: A group of toggle buttons where one or more can be active.
demo: ToggleGroupDemo
---

```bash
bosia add toggle-group
```

A group of toggle buttons for toolbar-style interactions. Supports single selection (like a radio group) or multiple selection (like checkboxes). Built on `role="group"` with roving tabindex and arrow key navigation.

## Preview

## ToggleGroup Props

| Prop       | Type                            | Default     |
| ---------- | ------------------------------- | ----------- |
| `type`     | `"single"` \| `"multiple"`      | `"single"`  |
| `value`    | `string` \| `string[]`          | `""` / `[]` |
| `variant`  | `"default"` \| `"outline"`      | `"default"` |
| `size`     | `"default"` \| `"sm"` \| `"lg"` | `"default"` |
| `disabled` | `boolean`                       | `false`     |
| `class`    | `string`                        | `""`        |

## ToggleGroupItem Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## Usage — Single Selection

```svelte
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
	let value = $state("bold");
</script>

<ToggleGroup type="single" bind:value aria-label="Text formatting">
	<ToggleGroupItem value="bold" aria-label="Bold"><b>B</b></ToggleGroupItem>
	<ToggleGroupItem value="italic" aria-label="Italic"><i>I</i></ToggleGroupItem>
	<ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
</ToggleGroup>
```

## Usage — Multiple Selection

```svelte
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
	let value = $state(["bold", "italic"]);
</script>

<ToggleGroup type="multiple" bind:value aria-label="Text formatting">
	<ToggleGroupItem value="bold" aria-label="Bold"><b>B</b></ToggleGroupItem>
	<ToggleGroupItem value="italic" aria-label="Italic"><i>I</i></ToggleGroupItem>
	<ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
</ToggleGroup>
```

## Outline Variant

```svelte
<ToggleGroup type="single" variant="outline" aria-label="Alignment">
	<ToggleGroupItem value="left">Left</ToggleGroupItem>
	<ToggleGroupItem value="center">Center</ToggleGroupItem>
	<ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

## Sizes

```svelte
<ToggleGroup type="single" size="sm">...</ToggleGroup>
<ToggleGroup type="single">...</ToggleGroup>
<ToggleGroup type="single" size="lg">...</ToggleGroup>
```

## Disabled

```svelte
<ToggleGroup type="single" disabled>
	<ToggleGroupItem value="bold"><b>B</b></ToggleGroupItem>
	<ToggleGroupItem value="italic"><i>I</i></ToggleGroupItem>
</ToggleGroup>
```
