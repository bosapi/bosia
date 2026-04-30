---
title: Form Actions
description: Tangani pengiriman formulir dengan aksi sisi server dan validasi.
---

Form action memungkinkan Anda menangani pengiriman `<form>` di server, dengan pola validasi bawaan.

## Mendefinisikan Actions

Ekspor objek `actions` dari `+page.server.ts`:

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

Sebuah `<form method="POST">` tanpa atribut `action` akan mengenai action `default`:

```svelte
<form method="POST">
	<input name="name" value={form?.name ?? ""} />
	<input name="email" value={form?.email ?? ""} />
	<button type="submit">Submit</button>
</form>
```

## Named Actions

Gunakan atribut `action` dengan awalan `?/` untuk menarget action tertentu:

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

## Validasi dengan fail()

`fail()` mengembalikan sebuah `ActionFailure` — ia **dikembalikan**, bukan dilempar:

```ts
import { fail } from "bosia";

// Returns a 400 response with the error data
return fail(400, {
	email, // preserve user input
	name,
	errors: { email: "Invalid email format" },
});
```

## Mengakses Data Action

Hasil action tersedia sebagai prop `form`:

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

## Redirect dari Actions

Gunakan `redirect()` untuk berpindah halaman setelah action berhasil:

```ts
import { redirect } from "bosia";

export const actions = {
	default: async ({ request }: RequestEvent) => {
		// Process form...
		redirect(303, "/thank-you");
	},
};
```

## Cara Kerjanya

1. Browser mengirimkan formulir sebagai request POST standar
2. Bosia memanggil fungsi action yang cocok
3. Saat **berhasil**: halaman dirender ulang dengan nilai kembalian action sebagai prop `form` dan data `load()` yang segar
4. Saat **fail()**: halaman dirender ulang dengan data kegagalan sebagai prop `form` pada kode status yang ditentukan
5. Saat **redirect()**: browser mengikuti redirect
