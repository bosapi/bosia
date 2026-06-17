---
title: Textarea
description: Komponen input teks multi-baris bergaya.
demo: TextareaDemo
---

```bash
bun x bosia@latest add textarea
```

Input teks multi-baris dengan value bindable dan tinggi yang tumbuh otomatis.

## Preview

## Props

| Prop          | Type      | Default |
| ------------- | --------- | ------- |
| `value`       | `string`  | `""`    |
| `placeholder` | `string`  | `""`    |
| `disabled`    | `boolean` | `false` |
| `id`          | `string`  | —       |
| `name`        | `string`  | —       |

## Penggunaan

```svelte
<script lang="ts">
	import { Textarea } from "$lib/components/ui/textarea";
	let message = $state("");
</script>

<Textarea bind:value={message} placeholder="Type your message..." />
```

## Dengan Label

```svelte
<label for="bio" class="text-sm font-medium">Bio</label>
<Textarea id="bio" placeholder="Tell us about yourself..." />
```
