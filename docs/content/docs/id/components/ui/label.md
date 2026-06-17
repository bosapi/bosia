---
title: Label
description: Komponen label yang aksesibel untuk kontrol form.
demo: LabelDemo
---

```bash
bun x bosia@latest add label
```

Label aksesibel yang berpasangan dengan kontrol form. Otomatis meredup saat kontrol terkait dinonaktifkan via modifier `peer-disabled`.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `for`   | `string` | —       |
| `class` | `string` | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
</script>

<div class="grid w-full max-w-sm gap-1.5">
	<Label for="email">Email</Label>
	<Input type="email" id="email" placeholder="you@example.com" />
</div>
```

## State Nonaktif

Saat dipasangkan dengan input yang dinonaktifkan memakai modifier `peer` Tailwind, label otomatis mengurangi opacity:

```svelte
<div class="grid w-full max-w-sm gap-1.5">
	<Input type="email" id="email-disabled" disabled class="peer" />
	<Label for="email-disabled">Email (disabled)</Label>
</div>
```
