---
title: Todo Item
description: A single todo item with toggle, inline edit, and delete actions.
---

```bash
bosia add todo/todo-item
```

Renders a single todo with toggle (complete/incomplete), inline editing on double-click, and a delete button. Uses form actions (`?/toggle`, `?/update`, `?/delete`).

## Props

| Prop   | Type   | Default |
| ------ | ------ | ------- |
| `todo` | `Todo` | —       |

The `Todo` type is defined in the todo feature (`src/features/todo/types.ts`).

## Usage

```svelte
<script lang="ts">
	import { TodoItem } from "$lib/components/todo";
	import type { Todo } from "$lib/features/todo/types";

	let { todo }: { todo: Todo } = $props();
</script>

<TodoItem {todo} />
```
