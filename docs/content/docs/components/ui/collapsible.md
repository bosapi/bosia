---
title: Collapsible
description: An interactive component which expands/collapses a panel.
demo: CollapsibleDemo
---

```bash
bosia add collapsible
```

A simple expand/collapse primitive. Unlike Accordion, Collapsible manages a single open/closed state with no multi-item coordination or arrow-key navigation.

## Preview

## Collapsible Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `open`     | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

`open` is `$bindable()`.

## CollapsibleTrigger Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders a `<button>` with `aria-expanded` and `aria-controls` wired automatically.

## CollapsibleContent Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Renders conditionally when open. Has `role="region"` and `aria-labelledby` pointing to the trigger.

## Usage

```svelte
<script lang="ts">
	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
	} from "$lib/components/ui/collapsible";

	let open = $state(false);
</script>

<Collapsible bind:open>
	<CollapsibleTrigger>Toggle</CollapsibleTrigger>
	<CollapsibleContent>Hidden content revealed on toggle.</CollapsibleContent>
</Collapsible>
```

## Disabled

```svelte
<Collapsible disabled>
	<CollapsibleTrigger>Cannot toggle</CollapsibleTrigger>
	<CollapsibleContent>This content is never shown.</CollapsibleContent>
</Collapsible>
```

## Accessibility

| Attribute         | Element      | Value                       |
| ----------------- | ------------ | --------------------------- |
| `aria-expanded`   | Trigger      | `true` / `false`            |
| `aria-controls`   | Trigger      | Points to content `id`      |
| `role="region"`   | Content      | Landmark for screen readers |
| `aria-labelledby` | Content      | Points to trigger `id`      |
| `data-state`      | All          | `"open"` / `"closed"`       |
| `data-disabled`   | Root/Trigger | Present when disabled       |
