---
title: Textarea
description: A styled multi-line text input component.
demo: TextareaDemo
---

```bash
bosia add textarea
```

A multi-line text input with bindable value and auto-growing height.

## Preview

## Props

| Prop          | Type      | Default |
| ------------- | --------- | ------- |
| `value`       | `string`  | `""`    |
| `placeholder` | `string`  | `""`    |
| `disabled`    | `boolean` | `false` |
| `id`          | `string`  | —       |
| `name`        | `string`  | —       |

## Usage

```svelte
<script lang="ts">
	import { Textarea } from "$lib/components/ui/textarea";
	let message = $state("");
</script>

<Textarea bind:value={message} placeholder="Type your message..." />
```

## With Label

```svelte
<label for="bio" class="text-sm font-medium">Bio</label>
<Textarea id="bio" placeholder="Tell us about yourself..." />
```
