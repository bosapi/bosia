---
title: Resizable
description: Accessible resizable panel groups and layouts with drag support.
demo: ResizableDemo
---

```bash
bosia add resizable
```

Drag-to-resize panel groups. Supports horizontal and vertical layouts, nested groups, and an optional grip handle.

## Preview

## Props

### ResizablePaneGroup

| Prop        | Type                         | Default        |
| ----------- | ---------------------------- | -------------- |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `class`     | `string`                     | `""`           |

### ResizablePane

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### ResizableHandle

| Prop         | Type      | Default |
| ------------ | --------- | ------- |
| `withHandle` | `boolean` | `false` |
| `class`      | `string`  | `""`    |

## Usage

```svelte
<script lang="ts">
	import {
		ResizablePaneGroup,
		ResizablePane,
		ResizableHandle,
	} from "$lib/components/ui/resizable";
</script>

<ResizablePaneGroup direction="horizontal" class="rounded-lg border">
	<ResizablePane class="p-6">One</ResizablePane>
	<ResizableHandle withHandle />
	<ResizablePane class="p-6">Two</ResizablePane>
</ResizablePaneGroup>
```
