---
title: Input Group
description: A composite input container for combining inputs with addons, buttons, and text.
demo: InputGroupDemo
---

```bash
bosia add input-group
```

Input Group composes inputs with prefix/suffix addons — icons, text, buttons, or other components — inside a single bordered container with shared focus state.

## Preview

## Sub-components

| Component            | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `InputGroup`         | Root container with border, rounded corners, and `focus-within` styling. |
| `InputGroupInput`    | Borderless input that fills the remaining horizontal space.              |
| `InputGroupTextarea` | Borderless multi-line variant for textarea input.                        |
| `InputGroupAddon`    | Prefix/suffix wrapper positioned via the `align` prop.                   |
| `InputGroupButton`   | Compact button sized to fit inside addons.                               |
| `InputGroupText`     | Muted semantic text for currency, units, domains, etc.                   |

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

## Usage

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

## Search Input with Icon

```svelte
<InputGroup>
	<InputGroupAddon>
		<SearchIcon class="size-4" />
	</InputGroupAddon>
	<InputGroupInput placeholder="Search..." />
</InputGroup>
```

## Textarea with Block Addon

Use `block-start` or `block-end` addons to stack a toolbar above or below a textarea.

```svelte
<InputGroup>
	<InputGroupTextarea placeholder="Type a message..." />
	<InputGroupAddon align="block-end">
		<InputGroupButton class="ml-auto">Send</InputGroupButton>
	</InputGroupAddon>
</InputGroup>
```
