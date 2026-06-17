---
title: Slider
description: Input slider untuk memilih nilai numerik, mendukung mode tunggal dan rentang.
demo: SliderDemo
---

```bash
bun x bosia@latest add slider
```

Slider yang dibangun di atas pointer event dan ARIA `role="slider"`, dengan mode satu-thumb dan rentang (dua-thumb), orientasi horizontal dan vertikal.

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

## Penggunaan

```svelte
<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	let value = $state(50);
</script>

<Slider bind:value /><p>Value: {value}</p>
```

## Rentang

Gunakan `type="range"` untuk dua thumb. Value-nya berupa tuple `[number, number]`.

```svelte
<script lang="ts">
	import { Slider } from "$lib/components/ui/slider";
	let range = $state<[number, number]>([20, 80]);
</script>

<Slider type="range" bind:value={range} /><p>From {range[0]} to {range[1]}</p>
```

## Vertikal

```svelte
<div class="h-40">
	<Slider orientation="vertical" value={40} />
</div>
```

## Step Kustom

```svelte
<Slider step={10} value={50} />
```

## Nonaktif

```svelte
<Slider disabled value={60} />
```

## Penggunaan Form

Saat prop `name` diberikan, elemen `<input>` tersembunyi dirender untuk pengiriman form native. Mode rentang men-submit dua nilai dengan `name[]`.

```svelte
<form method="POST">
	<Slider name="volume" value={75} />
	<button type="submit">Save</button>
</form>
```
