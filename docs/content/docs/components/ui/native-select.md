---
title: Native Select
description: A styled native HTML select component.
demo: NativeSelectDemo
---

```bash
bosia add native-select
```

A styled wrapper around the native HTML `<select>` element. Uses `appearance-none` with a custom chevron. Great for mobile and form compatibility.

## Preview

## Props

### NativeSelect

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | `""`    |
| `disabled` | `boolean` | `false` |
| `id`       | `string`  | —       |
| `name`     | `string`  | —       |

### NativeSelectOption

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |

### NativeSelectOptGroup

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `label`    | `string`  | —       |
| `disabled` | `boolean` | `false` |

## Usage

```svelte
<script lang="ts">
	import { NativeSelect, NativeSelectOption } from "$lib/components/ui/native-select";
	let color = $state("red");
</script>

<NativeSelect bind:value={color}>
	<NativeSelectOption value="red">Red</NativeSelectOption>
	<NativeSelectOption value="green">Green</NativeSelectOption>
	<NativeSelectOption value="blue">Blue</NativeSelectOption>
</NativeSelect>
```

## With Option Groups

```svelte
<script lang="ts">
	import {
		NativeSelect,
		NativeSelectOption,
		NativeSelectOptGroup,
	} from "$lib/components/ui/native-select";
	let vehicle = $state("");
</script>

<NativeSelect bind:value={vehicle}>
	<NativeSelectOptGroup label="Cars">
		<NativeSelectOption value="sedan">Sedan</NativeSelectOption>
		<NativeSelectOption value="suv">SUV</NativeSelectOption>
	</NativeSelectOptGroup>
	<NativeSelectOptGroup label="Bikes">
		<NativeSelectOption value="road">Road Bike</NativeSelectOption>
		<NativeSelectOption value="mountain">Mountain Bike</NativeSelectOption>
	</NativeSelectOptGroup>
</NativeSelect>
```
