---
title: Radio Group
description: A set of radio buttons for single-selection input.
demo: RadioGroupDemo
---

```bash
bosia add radio-group
```

A compound radio group built on `<button role="radio">` elements with arrow key navigation, roving tabindex, and hidden inputs for form submission.

## Preview

## RadioGroup Props

| Prop       | Type      | Default                |
| ---------- | --------- | ---------------------- |
| `value`    | `string`  | `undefined` (bindable) |
| `name`     | `string`  | —                      |
| `disabled` | `boolean` | `false`                |
| `required` | `boolean` | `false`                |
| `class`    | `string`  | `""`                   |

## RadioGroupItem Props

| Prop       | Type      | Default  |
| ---------- | --------- | -------- |
| `value`    | `string`  | required |
| `id`       | `string`  | —        |
| `disabled` | `boolean` | `false`  |
| `class`    | `string`  | `""`     |

## Usage

```svelte
<script lang="ts">
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	let selected = $state("option-1");
</script>

<RadioGroup bind:value={selected}>
	<RadioGroupItem value="option-1" />
	<RadioGroupItem value="option-2" />
	<RadioGroupItem value="option-3" />
</RadioGroup>
```

## With Labels

```svelte
<script lang="ts">
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	import { Label } from "$lib/components/ui/label";
</script>

<RadioGroup value="comfortable">
	<div class="flex items-center gap-2">
		<RadioGroupItem value="compact" id="compact" />
		<Label for="compact">Compact</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="comfortable" id="comfortable" />
		<Label for="comfortable">Comfortable</Label>
	</div>
</RadioGroup>
```

## Disabled

Disable the entire group or individual items.

```svelte
<!-- Disable all items -->
<RadioGroup disabled value="a">
	<RadioGroupItem value="a" />
	<RadioGroupItem value="b" />
</RadioGroup>

<!-- Disable one item -->
<RadioGroup value="a">
	<RadioGroupItem value="a" />
	<RadioGroupItem value="b" disabled />
</RadioGroup>
```

## Form Usage

When a `name` prop is provided on the group, each item renders a hidden `<input type="radio">` for native form submission.

```svelte
<form method="POST">
	<RadioGroup name="plan" value="pro">
		<RadioGroupItem value="free" />
		<RadioGroupItem value="pro" />
		<RadioGroupItem value="enterprise" />
	</RadioGroup>
	<button type="submit">Continue</button>
</form>
```

## Keyboard Navigation

| Key                        | Action                                    |
| -------------------------- | ----------------------------------------- |
| `ArrowDown` / `ArrowRight` | Move focus to next item and select it     |
| `ArrowUp` / `ArrowLeft`    | Move focus to previous item and select it |
| `Space`                    | Select the focused item                   |
| `Tab`                      | Move focus into/out of the radio group    |
