---
title: Field
description: Wrapper form field yang otomatis menyambungkan atribut aksesibilitas via konteks.
demo: FieldDemo
---

```bash
bun x bosia@latest add field
```

Field adalah wrapper layout dan aksesibilitas untuk kontrol form. Ia menghasilkan `id` unik dan meneruskan `aria-describedby` serta `aria-invalid` ke children via konteks Svelte — tanpa penyambungan manual.

## Preview

## Sub-komponen

| Komponen           | Tujuan                                                                        |
| ------------------ | ----------------------------------------------------------------------------- |
| `Field`            | Kontainer root. Menerima prop `error` dan menyediakan konteks ke children.    |
| `FieldLabel`       | Merender `<label>` dengan `for` yang otomatis tersambung dari konteks.        |
| `FieldControl`     | Meneruskan `{ id, aria-describedby, aria-invalid }` ke snippet `child`-nya.   |
| `FieldDescription` | Teks bantuan `<p>` ditautkan via `aria-describedby`.                          |
| `FieldError`       | Pesan error `<p role="alert">`. Jatuh ke `error` konteks jika tanpa children. |

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

| Prop    | Type                                                | Deskripsi                               |
| ------- | --------------------------------------------------- | --------------------------------------- |
| `child` | `Snippet<[{ id, aria-describedby, aria-invalid }]>` | Snippet bernama yang menerima prop a11y |

### FieldDescription

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### FieldError

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Penggunaan

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

## Konten Error Kustom

Anda bisa memberikan children kustom ke `FieldError` alih-alih memakai `error` konteks:

```svelte
<FieldError>
	<span class="flex items-center gap-1">Please fix this field.</span>
</FieldError>
```
