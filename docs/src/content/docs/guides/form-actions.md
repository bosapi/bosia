---
title: Form Actions
description: Handle form submissions with server-side actions and validation.
---

Form actions let you handle `<form>` submissions on the server, with built-in validation patterns.

## Defining Actions

Export an `actions` object from `+page.server.ts`:

```ts
// src/routes/contact/+page.server.ts
import { fail } from "bosbun";
import type { RequestEvent } from "bosbun";

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
import { fail } from "bosbun";

// Returns a 400 response with the error data
return fail(400, {
  email,        // preserve user input
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
import { redirect } from "bosbun";

export const actions = {
  default: async ({ request }: RequestEvent) => {
    // Process form...
    redirect(303, "/thank-you");
  },
};
```

## How It Works

1. Browser submits the form as a standard POST request
2. Bosbun calls the matching action function
3. On **success**: the page re-renders with the action return value as `form` prop and fresh `load()` data
4. On **fail()**: the page re-renders with the failure data as `form` prop at the specified status code
5. On **redirect()**: the browser follows the redirect
