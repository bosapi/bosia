---
title: Todo Form
description: A form component for creating new todo items with validation feedback.
---

```bash
bosia add todo/todo-form
```

A form that submits a `POST` to `?/create` with a `title` field. Displays an optional error message below.

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `error` | `string` | —       |

## Usage

```svelte
<script lang="ts">
  import { TodoForm } from "$lib/components/todo";
</script>

<TodoForm error={form?.error} />
```
