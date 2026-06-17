---
title: Resizable
description: Grup panel dan layout yang bisa diubah ukuran dengan dukungan drag, aksesibel.
demo: ResizableDemo
---

```bash
bun x bosia@latest add resizable
```

Grup panel drag-to-resize. Mendukung layout horizontal dan vertikal, grup bersarang, dan handle grip opsional.

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

## Penggunaan

```svelte
<script lang="ts">
	import { ResizablePaneGroup, ResizablePane, ResizableHandle } from "$lib/components/ui/resizable";
</script>

<ResizablePaneGroup direction="horizontal" class="rounded-lg border">
	<ResizablePane class="p-6">One</ResizablePane>
	<ResizableHandle withHandle />
	<ResizablePane class="p-6">Two</ResizablePane>
</ResizablePaneGroup>
```
