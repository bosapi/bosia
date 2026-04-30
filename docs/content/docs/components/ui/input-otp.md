---
title: Input OTP
description: Accessible one-time password input with copy-paste support.
demo: InputOtpDemo
---

```bash
bosia add input-otp
```

Input OTP renders a row of character cells that feel like separate boxes but behave like a single input — paste a full code in any cell, backspace to step back, and benefit from mobile SMS autofill via `autocomplete="one-time-code"`.

## Preview

## Sub-components

| Component           | Purpose                                                                               |
| ------------------- | ------------------------------------------------------------------------------------- |
| `InputOTP`          | Root container with a hidden `<input>` overlay that owns focus, caret, and selection. |
| `InputOTPGroup`     | Visual grouping for a sequence of slots.                                              |
| `InputOTPSlot`      | Single character cell bound to an `index` into the current value.                     |
| `InputOTPSeparator` | Visual divider between groups (defaults to a minus glyph).                            |

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

| Prop    | Type     | Default      |
| ------- | -------- | ------------ |
| `index` | `number` | — (required) |
| `class` | `string` | `""`         |

## Usage

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

## Notes

- The real `<input>` is absolutely positioned over the slot row with `opacity: 0`, so it owns focus, caret, paste, and IME while the slot `<div>`s render the visible characters and an active-cell ring.
- `pattern` is evaluated on every input — rejected values revert to the last valid string. Defaults to no filter (allow any character).
- `onComplete` fires once when `value.length === maxlength`.
- On iOS, SMS autofill suggestions surface because of `autocomplete="one-time-code"`.
