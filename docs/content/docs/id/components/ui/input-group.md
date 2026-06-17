---
title: Input Group
description: Kontainer input komposit untuk menggabungkan input dengan addon, button, dan teks.
demo: InputGroupDemo
---

```bash
bun x bosia@latest add input-group
```

Input Group mengomposisikan input dengan addon prefix/suffix — ikon, teks, button, atau komponen lain — di dalam satu kontainer berborder dengan state fokus bersama.

## Preview

## Sub-komponen

| Komponen             | Tujuan                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `InputGroup`         | Kontainer root dengan border, sudut membulat, dan styling `focus-within`. |
| `InputGroupInput`    | Input tanpa border yang mengisi sisa ruang horizontal.                    |
| `InputGroupTextarea` | Varian multi-baris tanpa border untuk input textarea.                     |
| `InputGroupAddon`    | Wrapper prefix/suffix yang diposisikan via prop `align`.                  |
| `InputGroupButton`   | Button ringkas berukuran agar pas di dalam addon.                         |
| `InputGroupText`     | Teks semantik muted untuk mata uang, satuan, domain, dll.                 |

## Props

### InputGroup

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### InputGroupInput

| Prop          | Type                | Default  |
| ------------- | ------------------- | -------- |
| `type`        | `string`            | `"text"` |
| `value`       | `string` (bindable) | `""`     |
| `placeholder` | `string`            | `""`     |
| `disabled`    | `boolean`           | `false`  |
| `class`       | `string`            | `""`     |

### InputGroupTextarea

| Prop          | Type                | Default |
| ------------- | ------------------- | ------- |
| `value`       | `string` (bindable) | `""`    |
| `placeholder` | `string`            | `""`    |
| `disabled`    | `boolean`           | `false` |
| `class`       | `string`            | `""`    |

### InputGroupAddon

| Prop    | Type                                                             | Default          |
| ------- | ---------------------------------------------------------------- | ---------------- |
| `align` | `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` | `"inline-start"` |
| `class` | `string`                                                         | `""`             |

### InputGroupButton

| Prop       | Type                                     | Default    |
| ---------- | ---------------------------------------- | ---------- |
| `size`     | `"xs" \| "sm" \| "icon-xs" \| "icon-sm"` | `"xs"`     |
| `type`     | `"button" \| "submit" \| "reset"`        | `"button"` |
| `disabled` | `boolean`                                | `false`    |
| `class`    | `string`                                 | `""`       |

### InputGroupText

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import {
		InputGroup,
		InputGroupInput,
		InputGroupAddon,
		InputGroupText,
	} from "$lib/components/ui/input-group";

	let amount = $state("");
</script>

<InputGroup>
	<InputGroupAddon>
		<InputGroupText>$</InputGroupText>
	</InputGroupAddon>
	<InputGroupInput bind:value={amount} type="number" placeholder="0.00" />
	<InputGroupAddon align="inline-end">
		<InputGroupText>USD</InputGroupText>
	</InputGroupAddon>
</InputGroup>
```

## Input Pencarian dengan Ikon

```svelte
<InputGroup>
	<InputGroupAddon>
		<SearchIcon class="size-4" />
	</InputGroupAddon>
	<InputGroupInput placeholder="Search..." />
</InputGroup>
```

## Textarea dengan Addon Block

Gunakan addon `block-start` atau `block-end` untuk menumpuk toolbar di atas atau di bawah textarea.

```svelte
<InputGroup>
	<InputGroupTextarea placeholder="Type a message..." />
	<InputGroupAddon align="block-end">
		<InputGroupButton class="ml-auto">Send</InputGroupButton>
	</InputGroupAddon>
</InputGroup>
```
