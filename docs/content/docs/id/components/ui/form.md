---
title: Form
description: Wrapper form yang mengelola state validasi dan meneruskan error ke komponen Field via konteks.
demo: FormDemo
---

```bash
bun x bosia@latest add form
```

Form membungkus elemen `<form>` native dan menyediakan pengelolaan state validasi. Error otomatis didistribusikan ke komponen `Field` anak via konteks Svelte — tanpa penyambungan prop error manual.

## Preview

## Cara Kerjanya

1. Pengguna men-submit form
2. `validate(FormData)` berjalan dan mengembalikan `Record<string, string>` berisi error per field
3. Error disimpan di konteks form
4. Setiap `Field` dengan prop `name` yang cocok membaca error-nya dari konteks
5. Jika tanpa error, `onsubmit(FormData)` dipanggil

## Props

### Form

| Prop       | Type                                         | Default | Deskripsi                                            |
| ---------- | -------------------------------------------- | ------- | ---------------------------------------------------- |
| `validate` | `(data: FormData) => Record<string, string>` | —       | Fungsi validasi. Kembalikan objek kosong jika valid. |
| `onsubmit` | `(data: FormData) => void \| Promise<void>`  | —       | Dipanggil dengan FormData saat validasi lolos.       |
| `class`    | `string`                                     | `""`    | Kelas CSS tambahan.                                  |

### Field (diperbarui)

| Prop    | Type     | Default | Deskripsi                              |
| ------- | -------- | ------- | -------------------------------------- |
| `name`  | `string` | —       | Menautkan field ini ke key error form. |
| `error` | `string` | —       | Error langsung (menimpa konteks form). |

## API Konteks

Form menyediakan hal berikut via `getContext("form")`:

| Method                     | Deskripsi                                   |
| -------------------------- | ------------------------------------------- |
| `fieldError(name)`         | Ambil pesan error untuk sebuah field.       |
| `setFieldError(name, msg)` | Setel error pada field tertentu.            |
| `clearFieldError(name)`    | Hapus error pada field tertentu.            |
| `submitting`               | Getter — `true` selama `onsubmit` berjalan. |

## Penggunaan

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

## Dengan Library Schema

Fungsi `validate` bekerja dengan library validasi apa pun. Berikut contoh dengan Zod:

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

## Submit Async

`onsubmit` mendukung fungsi async. Selama berjalan, `context.submitting` bernilai `true`:

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

## Field Mandiri

`Field` tetap berfungsi tanpa `Form`. Prop `name` opsional — tanpanya (atau tanpa wrapper `Form`), `Field` berperilaku persis seperti sebelumnya:

```svelte
<Field error="Direct error">
	<!-- works without Form -->
</Field>
```

## Reset

Mereset form (via `<button type="reset">` atau `form.reset()`) menghapus semua error validasi.
