---
title: Input
description: A styled text input component.
demo: InputDemo
---

```bash
bosia add input
```

A styled text input with bindable value.

## Preview

## Props

| Prop          | Type      | Default |
| ------------- | --------- | ------- |
| `type`        | `string`  | `"text"`|
| `value`       | `string`  | `""`    |
| `placeholder` | `string`  | `""`    |
| `disabled`    | `boolean` | `false` |
| `id`          | `string`  | —       |
| `name`        | `string`  | —       |

## Usage

```svelte
<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  let search = $state("");
</script>

<Input bind:value={search} placeholder="Search..." />
```

## With Label

```svelte
<label for="email" class="text-sm font-medium">Email</label>
<Input id="email" type="email" placeholder="you@example.com" />
```
