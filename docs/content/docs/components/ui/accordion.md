---
title: Accordion
description: A vertically stacked set of interactive headings that each reveal a section of content.
demo: AccordionDemo
---

```bash
bosia add accordion
```

A compound component for collapsing sections of content. Built on `aria-expanded` triggers wired to `role="region"` panels, with roving arrow-key navigation and support for single- or multi-open modes.

## Preview

## Accordion Props

| Prop          | Type                     | Default    |
| ------------- | ------------------------ | ---------- |
| `type`        | `"single" \| "multiple"` | `"single"` |
| `value`       | `string \| string[]`     | `""`/`[]`  |
| `collapsible` | `boolean`                | `false`    |
| `disabled`    | `boolean`                | `false`    |
| `class`       | `string`                 | `""`       |

`value` is `$bindable()`. In `single` mode it is a `string`; in `multiple` mode it is a `string[]`. `collapsible` only applies when `type="single"` — when true, clicking the open item closes it.

## AccordionItem Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## AccordionTrigger Props

| Prop    | Type                         | Default |
| ------- | ---------------------------- | ------- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     |
| `class` | `string`                     | `""`    |

`level` sets the semantic heading element (`<h1>`–`<h6>`) that wraps the trigger button, per the WAI-ARIA accordion pattern.

## AccordionContent Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Usage

```svelte
<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
	} from "$lib/components/ui/accordion";

	let value = $state("item-1");
</script>

<Accordion type="single" collapsible bind:value>
	<AccordionItem value="item-1">
		<AccordionTrigger>Is it accessible?</AccordionTrigger>
		<AccordionContent>Yes. It ships with full keyboard navigation.</AccordionContent>
	</AccordionItem>
	<AccordionItem value="item-2">
		<AccordionTrigger>Is it styled?</AccordionTrigger>
		<AccordionContent>Yes. It matches the rest of the registry.</AccordionContent>
	</AccordionItem>
</Accordion>
```

## Multiple Open

```svelte
<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
	} from "$lib/components/ui/accordion";

	let value = $state<string[]>(["a"]);
</script>

<Accordion type="multiple" bind:value>
	<AccordionItem value="a">
		<AccordionTrigger>Section A</AccordionTrigger>
		<AccordionContent>A content.</AccordionContent>
	</AccordionItem>
	<AccordionItem value="b">
		<AccordionTrigger>Section B</AccordionTrigger>
		<AccordionContent>B content.</AccordionContent>
	</AccordionItem>
</Accordion>
```

## Disabled Item

```svelte
<Accordion type="single" collapsible>
	<AccordionItem value="a">
		<AccordionTrigger>Enabled</AccordionTrigger>
		<AccordionContent>Open me.</AccordionContent>
	</AccordionItem>
	<AccordionItem value="b" disabled>
		<AccordionTrigger>Disabled</AccordionTrigger>
		<AccordionContent>Never shown.</AccordionContent>
	</AccordionItem>
</Accordion>
```

## Keyboard Navigation

| Key             | Action                             |
| --------------- | ---------------------------------- |
| `ArrowDown`     | Move focus to the next trigger     |
| `ArrowUp`       | Move focus to the previous trigger |
| `Home`          | Move focus to the first trigger    |
| `End`           | Move focus to the last trigger     |
| `Space`/`Enter` | Toggle the focused item            |
