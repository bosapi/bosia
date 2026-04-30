---
title: Field
description: A form field wrapper that auto-wires accessibility attributes via context.
demo: FieldDemo
---

```bash
bosia add field
```

Field is a layout and accessibility wrapper for form controls. It generates a unique `id` and passes `aria-describedby` and `aria-invalid` to children via Svelte context — no manual plumbing required.

## Preview

## Sub-components

| Component          | Purpose                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `Field`            | Root container. Accepts an `error` prop and provides context to children.       |
| `FieldLabel`       | Renders a `<label>` with `for` auto-wired from context.                         |
| `FieldControl`     | Passes `{ id, aria-describedby, aria-invalid }` to its `child` snippet.         |
| `FieldDescription` | Helper text `<p>` linked via `aria-describedby`.                                |
| `FieldError`       | Error message `<p role="alert">`. Falls back to context `error` if no children. |

## Props

### Field

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `error` | `string` | —       |
| `class` | `string` | `""`    |

### FieldLabel

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### FieldControl

| Prop    | Type                                                | Description                        |
| ------- | --------------------------------------------------- | ---------------------------------- |
| `child` | `Snippet<[{ id, aria-describedby, aria-invalid }]>` | Named snippet receiving a11y props |

### FieldDescription

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### FieldError

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Usage

```svelte
<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldControl,
		FieldDescription,
		FieldError,
	} from "$lib/components/ui/field";
	import { Input } from "$lib/components/ui/input";

	let email = $state("");
	let error = $state("");
</script>

<Field {error}>
	<FieldLabel>Email</FieldLabel>
	<FieldControl>
		{#snippet child({ id, ...aria })}
			<Input {id} {...aria} bind:value={email} type="email" />
		{/snippet}
	</FieldControl>
	<FieldDescription>We'll never share your email.</FieldDescription>
	<FieldError />
</Field>
```

## Custom Error Content

You can pass custom children to `FieldError` instead of using the context `error`:

```svelte
<FieldError>
	<span class="flex items-center gap-1">Please fix this field.</span>
</FieldError>
```
