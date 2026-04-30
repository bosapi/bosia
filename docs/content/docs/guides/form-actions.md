---
title: Form Actions
description: Handle form submissions with server-side actions and validation.
---

Form actions let you handle `<form>` submissions on the server, with built-in validation patterns.

## Defining Actions

Export an `actions` object from `+page.server.ts`:

```ts
// src/routes/contact/+page.server.ts
import { fail } from "bosia";
import type { RequestEvent } from "bosia";

export async function load() {
	return { greeting: "Contact us" };
}

export const actions = {
	default: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const email = data.get("email") as string;
		const name = data.get("name") as string;

		const errors: Record<string, string> = {};
		if (!email) errors.email = "Email is required";
		if (!name) errors.name = "Name is required";

		if (Object.keys(errors).length > 0) {
			return fail(400, { email, name, errors });
		}

		// Process the form...
		return { success: true, email, name };
	},
};
```

## Default Action

A `<form method="POST">` with no `action` attribute hits the `default` action:

```svelte
<form method="POST">
	<input name="name" value={form?.name ?? ""} />
	<input name="email" value={form?.email ?? ""} />
	<button type="submit">Submit</button>
</form>
```

## Named Actions

Use the `action` attribute with a `?/` prefix to target a specific action:

```svelte
<form method="POST" action="?/reset">
	<button type="submit">Reset</button>
</form>
```

```ts
export const actions = {
	default: async ({ request }: RequestEvent) => {
		// ...
	},
	reset: async () => {
		return { cleared: true };
	},
};
```

## Validation with fail()

`fail()` returns an `ActionFailure` — it's **returned**, not thrown:

```ts
import { fail } from "bosia";

// Returns a 400 response with the error data
return fail(400, {
	email, // preserve user input
	name,
	errors: { email: "Invalid email format" },
});
```

## Accessing Action Data

The action result is available as the `form` prop:

```svelte
<script lang="ts">
	let { data, form } = $props();
</script>

{#if form?.errors}
	<p class="text-red-500">{form.errors.email}</p>
{/if}

{#if form?.success}
	<p class="text-green-500">Submitted successfully!</p>
{/if}
```

## Redirects from Actions

Use `redirect()` to navigate after a successful action:

```ts
import { redirect } from "bosia";

export const actions = {
	default: async ({ request }: RequestEvent) => {
		// Process form...
		redirect(303, "/thank-you");
	},
};
```

## Progressive Enhancement (`use:enhance`)

By default, form submissions trigger a full-page reload. Apply the
`enhance` action to intercept submission, POST via `fetch`, and update
the `form` prop in place — no reload, scroll position preserved, focus
intact.

```svelte
<script lang="ts">
	import { enhance } from "bosia/client";
	let { data, form } = $props();
</script>

<form method="POST" use:enhance>
	<input name="email" value={form?.email ?? ""} />
	<button type="submit">Submit</button>
</form>
```

If JavaScript is disabled, the form falls back to the standard POST
flow described above — no extra work required.

### Customizing the submission

Pass a callback to run logic before the request fires (e.g. add an
`Authorization` header), and optionally return a second callback to
override the default post-result behavior:

```svelte
<form
	method="POST"
	use:enhance={({ formData, cancel }) => {
		if (!formData.get("email")) cancel();
		return async ({ result, update }) => {
			// Custom handling, then fall back to default behavior:
			await update({ reset: false, invalidateAll: true });
		};
	}}
>
	...
</form>
```

Defaults when no callback is returned:

- `success` → `form` prop set to action return data, form reset, loaders re-fetched
- `failure` → `form` prop set to failure data; form NOT reset
- `redirect` → SPA navigation to target
- `error` → `form` prop set to `{ error: { message, status } }`

Render error results inline:

```svelte
{#if form?.error}
	<p class="form-error">{form.error.message}</p>
{/if}
```

## How It Works

1. Browser submits the form as a standard POST request
2. Bosia calls the matching action function
3. On **success**: the page re-renders with the action return value as `form` prop and fresh `load()` data
4. On **fail()**: the page re-renders with the failure data as `form` prop at the specified status code
5. On **redirect()**: the browser follows the redirect

When `use:enhance` is active, steps 3–5 happen via JSON instead of a
page reload — the action runs on the server identically, only the
response shape differs (signaled by an `x-bosia-action: 1` header).
