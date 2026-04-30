---
title: Todo List
description: A list component that renders todo items with completion stats.
---

```bash
bosia add todo/todo-list
```

Renders a list of todos using `TodoItem`, with an empty state and a completion counter. Depends on `todo/todo-item`.

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `todos` | `Todo[]` | —       |

## Usage

```svelte
<script lang="ts">
	import { TodoList } from "$lib/components/todo";
	import type { Todo } from "$lib/features/todo/types";

	let { todos }: { todos: Todo[] } = $props();
</script>

<TodoList {todos} />
```
