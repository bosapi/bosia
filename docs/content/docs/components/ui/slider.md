---
title: Slider
description: A slider input for selecting numeric values, supporting single and range modes.
demo: SliderDemo
---

```bash
bosia add slider
```

A slider built on pointer events and ARIA `role="slider"`, with single-thumb and range (two-thumb) modes, horizontal and vertical orientations.

## Preview

## Props

| Prop          | Type                         | Default        |
| ------------- | ---------------------------- | -------------- |
| `type`        | `"single" \| "range"`        | `"single"`     |
| `value`       | `number \| [number, number]` | `0` or `[0,0]` |
| `min`         | `number`                     | `0`            |
| `max`         | `number`                     | `100`          |
| `step`        | `number`                     | `1`            |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `disabled`    | `boolean`                    | `false`        |
| `name`        | `string`                     | —              |
| `id`          | `string`                     | —              |
| `class`       | `string`                     | `""`           |

## Usage

```svelte
<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	let value = $state(50);
</script>

<Slider bind:value /><p>Value: {value}</p>
```

## Range

Use `type="range"` for two thumbs. The value is a `[number, number]` tuple.

```svelte
<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	let range = $state<[number, number]>([20, 80]);
</script>

<Slider type="range" bind:value={range} /><p>From {range[0]} to {range[1]}</p>
```

## Vertical

```svelte
<div class="h-40">
	<Slider orientation="vertical" value={40} />
</div>
```

## Custom Step

```svelte
<Slider step={10} value={50} />
```

## Disabled

```svelte
<Slider disabled value={60} />
```

## Form Usage

When a `name` prop is provided, hidden `<input>` elements are rendered for native form submission. Range mode submits two values with `name[]`.

```svelte
<form method="POST">
	<Slider name="volume" value={75} />
	<button type="submit">Save</button>
</form>
```
