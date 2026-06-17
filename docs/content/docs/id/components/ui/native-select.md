---
title: Native Select
description: Komponen select HTML native bergaya.
demo: NativeSelectDemo
---

```bash
bun x bosia@latest add native-select
```

Wrapper bergaya di sekitar elemen `<select>` HTML native. Memakai `appearance-none` dengan chevron kustom. Bagus untuk kompatibilitas mobile dan form.

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

## Penggunaan

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

## Dengan Grup Opsi

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
