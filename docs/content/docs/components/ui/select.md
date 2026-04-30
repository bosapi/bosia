---
title: Select
description: A dropdown select component for single-value selection.
demo: SelectDemo
---

```bash
bosia add select
```

A compound select component built on `role="combobox"` / `role="listbox"` with keyboard navigation, groups, labels, separators, and a hidden input for form submission.

## Preview

## Select Props

| Prop       | Type      | Default                |
| ---------- | --------- | ---------------------- |
| `value`    | `string`  | `undefined` (bindable) |
| `name`     | `string`  | —                      |
| `disabled` | `boolean` | `false`                |
| `required` | `boolean` | `false`                |
| `class`    | `string`  | `""`                   |

## SelectTrigger Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## SelectValue Props

| Prop          | Type     | Default              |
| ------------- | -------- | -------------------- |
| `placeholder` | `string` | `"Select an option"` |
| `class`       | `string` | `""`                 |

## SelectContent Props

| Prop    | Type                               | Default   |
| ------- | ---------------------------------- | --------- |
| `align` | `"start"` \| `"end"` \| `"center"` | `"start"` |
| `class` | `string`                           | `""`      |

## SelectItem Props

| Prop       | Type      | Default  |
| ---------- | --------- | -------- |
| `value`    | `string`  | required |
| `label`    | `string`  | —        |
| `disabled` | `boolean` | `false`  |
| `class`    | `string`  | `""`     |

## Usage

```svelte
<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectValue,
		SelectContent,
		SelectItem,
	} from "$lib/components/ui/select";

	let value = $state("apple");
</script>

<Select bind:value>
	<SelectTrigger class="w-[200px]">
		<SelectValue placeholder="Pick a fruit" />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="apple" label="Apple" />
		<SelectItem value="banana" label="Banana" />
		<SelectItem value="mango" label="Mango" />
	</SelectContent>
</Select>
```

## Groups & Labels

Use `SelectGroup` and `SelectLabel` to organize items into sections.

```svelte
<SelectContent>
	<SelectGroup>
		<SelectLabel>Fruits</SelectLabel>
		<SelectItem value="apple" label="Apple" />
		<SelectItem value="banana" label="Banana" />
	</SelectGroup>
	<SelectSeparator />
	<SelectGroup>
		<SelectLabel>Vegetables</SelectLabel>
		<SelectItem value="carrot" label="Carrot" />
	</SelectGroup>
</SelectContent>
```

## Disabled

Disable the entire select or individual items.

```svelte
<!-- Disable the whole select -->
<Select disabled value="apple">
	<SelectTrigger class="w-[200px]">
		<SelectValue />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="apple" label="Apple" />
	</SelectContent>
</Select>

<!-- Disable one item -->
<SelectContent>
	<SelectItem value="apple" label="Apple" />
	<SelectItem value="banana" label="Banana" disabled />
</SelectContent>
```

## Form Usage

When a `name` prop is provided, a hidden `<input>` is rendered for native form submission.

```svelte
<form method="POST">
	<Select name="fruit" value="apple">
		<SelectTrigger class="w-[200px]">
			<SelectValue />
		</SelectTrigger>
		<SelectContent>
			<SelectItem value="apple" label="Apple" />
			<SelectItem value="banana" label="Banana" />
		</SelectContent>
	</Select>
	<button type="submit">Submit</button>
</form>
```

## Keyboard Navigation

| Key                     | Action                   |
| ----------------------- | ------------------------ |
| `ArrowDown` / `ArrowUp` | Move focus between items |
| `Enter` / `Space`       | Select the focused item  |
| `Escape`                | Close the dropdown       |
