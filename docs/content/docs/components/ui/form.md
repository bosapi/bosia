---
title: Form
description: A form wrapper that manages validation state and feeds errors into Field components via context.
demo: FormDemo
---

```bash
bosia add form
```

Form wraps a native `<form>` element and provides validation state management. Errors are automatically distributed to child `Field` components via Svelte context — no manual error-prop wiring needed.

## Preview

## How It Works

1. User submits the form
2. `validate(FormData)` runs and returns a `Record<string, string>` of field errors
3. Errors are stored in form context
4. Each `Field` with a matching `name` prop reads its error from context
5. If no errors, `onsubmit(FormData)` is called

## Props

### Form

| Prop       | Type                                         | Default | Description                                         |
| ---------- | -------------------------------------------- | ------- | --------------------------------------------------- |
| `validate` | `(data: FormData) => Record<string, string>` | —       | Validation function. Return empty object for valid. |
| `onsubmit` | `(data: FormData) => void \| Promise<void>`  | —       | Called with FormData when validation passes.        |
| `class`    | `string`                                     | `""`    | Additional CSS classes.                             |

### Field (updated)

| Prop    | Type     | Default | Description                            |
| ------- | -------- | ------- | -------------------------------------- |
| `name`  | `string` | —       | Links this field to a form error key.  |
| `error` | `string` | —       | Direct error (overrides form context). |

## Context API

Form provides the following via `getContext("form")`:

| Method                     | Description                                  |
| -------------------------- | -------------------------------------------- |
| `fieldError(name)`         | Get the error message for a field.           |
| `setFieldError(name, msg)` | Set an error on a specific field.            |
| `clearFieldError(name)`    | Clear the error on a specific field.         |
| `submitting`               | Getter — `true` while `onsubmit` is running. |

## Usage

```svelte
<script lang="ts">
	import { Form } from "$lib/components/ui/form";
	import { Field, FieldLabel, FieldControl, FieldError } from "$lib/components/ui/field";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";

	function validate(data: FormData) {
		const errors: Record<string, string> = {};
		if (!data.get("email")) errors.email = "Required.";
		return errors;
	}

	function handleSubmit(data: FormData) {
		console.log("Submitted:", Object.fromEntries(data));
	}
</script>

<Form {validate} onsubmit={handleSubmit}>
	<Field name="email">
		<FieldLabel>Email</FieldLabel>
		<FieldControl>
			{#snippet child({ id, ...aria })}
				<Input {id} {...aria} name="email" type="email" />
			{/snippet}
		</FieldControl>
		<FieldError />
	</Field>
	<Button type="submit">Submit</Button>
</Form>
```

## With Schema Libraries

The `validate` function works with any validation library. Here's an example with Zod:

```svelte
<script lang="ts">
	import { z } from "zod";

	const schema = z.object({
		email: z.string().email(),
		password: z.string().min(8),
	});

	function validate(data: FormData) {
		const result = schema.safeParse(Object.fromEntries(data));
		if (result.success) return {};
		return Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
	}
</script>
```

## Async Submit

`onsubmit` supports async functions. While running, `context.submitting` is `true`:

```svelte
<Form
	{validate}
	onsubmit={async (data) => {
		await fetch("/api/login", { method: "POST", body: data });
	}}
>
	<!-- fields -->
</Form>
```

## Standalone Field

`Field` still works without `Form`. The `name` prop is optional — without it (or without a `Form` wrapper), `Field` behaves exactly as before:

```svelte
<Field error="Direct error">
	<!-- works without Form -->
</Field>
```

## Reset

Resetting the form (via `<button type="reset">` or `form.reset()`) clears all validation errors.
