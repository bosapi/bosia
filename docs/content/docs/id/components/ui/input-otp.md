---
title: Input OTP
description: Input one-time password yang aksesibel dengan dukungan copy-paste.
demo: InputOtpDemo
---

```bash
bun x bosia@latest add input-otp
```

Input OTP merender deretan sel karakter yang terasa seperti kotak terpisah tetapi berperilaku seperti satu input — tempel kode lengkap di sel mana pun, backspace untuk mundur, dan manfaatkan autofill SMS mobile via `autocomplete="one-time-code"`.

## Preview

## Sub-komponen

| Komponen            | Tujuan                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `InputOTP`          | Kontainer root dengan overlay `<input>` tersembunyi yang memegang fokus, caret, dan seleksi. |
| `InputOTPGroup`     | Pengelompokan visual untuk urutan slot.                                                      |
| `InputOTPSlot`      | Sel karakter tunggal yang terikat ke `index` dalam value saat ini.                           |
| `InputOTPSeparator` | Pembatas visual antar grup (default ke glyph minus).                                         |

## Props

### InputOTP

| Prop             | Type                         | Default           |
| ---------------- | ---------------------------- | ----------------- |
| `value`          | `string` (bindable)          | `""`              |
| `maxlength`      | `number`                     | `6`               |
| `pattern`        | `RegExp`                     | `undefined`       |
| `disabled`       | `boolean`                    | `false`           |
| `name`           | `string`                     | `undefined`       |
| `id`             | `string`                     | `undefined`       |
| `autocomplete`   | `string`                     | `"one-time-code"` |
| `inputmode`      | `"numeric" \| "text" \| ...` | `"numeric"`       |
| `onComplete`     | `(value: string) => void`    | `undefined`       |
| `class`          | `string`                     | `""`              |
| `containerClass` | `string`                     | `""`              |

### InputOTPSlot

| Prop    | Type     | Default   |
| ------- | -------- | --------- |
| `index` | `number` | — (wajib) |
| `class` | `string` | `""`      |

## Penggunaan

```svelte
<script lang="ts">
	import {
		InputOTP,
		InputOTPGroup,
		InputOTPSlot,
		InputOTPSeparator,
	} from "$lib/components/ui/input-otp";

	let value = $state("");
</script>

<InputOTP
	bind:value
	maxlength={6}
	pattern={/^\d*$/}
	onComplete={(code) => console.log("submit", code)}
>
	<InputOTPGroup>
		<InputOTPSlot index={0} />
		<InputOTPSlot index={1} />
		<InputOTPSlot index={2} />
	</InputOTPGroup>
	<InputOTPSeparator />
	<InputOTPGroup>
		<InputOTPSlot index={3} />
		<InputOTPSlot index={4} />
		<InputOTPSlot index={5} />
	</InputOTPGroup>
</InputOTP>
```

## Catatan

- `<input>` asli diposisikan absolut di atas baris slot dengan `opacity: 0`, sehingga ia memegang fokus, caret, paste, dan IME sementara `<div>` slot merender karakter yang terlihat dan ring sel aktif.
- `pattern` dievaluasi pada setiap input — value yang ditolak kembali ke string valid terakhir. Default ke tanpa filter (mengizinkan karakter apa pun).
- `onComplete` menyala sekali saat `value.length === maxlength`.
- Di iOS, saran autofill SMS muncul karena `autocomplete="one-time-code"`.
