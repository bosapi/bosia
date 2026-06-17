---
title: Chart
description: Grafik garis dan batang SVG dengan tooltip — tanpa dependensi, murni Svelte.
demo: ChartDemo
---

```bash
bun x bosia@latest add chart
```

Komponen grafik SVG murni dengan tooltip, ukuran responsif, dan pemformatan sumbu otomatis. Tanpa library charting eksternal.

## Preview

## Line Chart

```svelte
<script lang="ts">
	import { LineChart } from "$lib/components/ui/chart";

	const data = [
		{ date: "2024-01-01", value: 120 },
		{ date: "2024-01-02", value: 340 },
		{ date: "2024-01-03", value: 280 },
		{ date: "2024-01-04", value: 450 },
		{ date: "2024-01-05", value: 390 },
	];
</script>

<LineChart {data} />
```

### Props Line Chart

| Prop          | Type                                         | Default                       |
| ------------- | -------------------------------------------- | ----------------------------- |
| `data`        | `{ date: string \| Date; value: number }[]`  | `[]`                          |
| `height`      | `number`                                     | `300`                         |
| `granularity` | `"day"` \| `"week"` \| `"month"` \| `"year"` | `"day"`                       |
| `color`       | `string`                                     | `"hsl(var(--color-primary))"` |
| `showArea`    | `boolean`                                    | `false`                       |
| `showDots`    | `boolean`                                    | `true`                        |

### Varian Area Chart

```svelte
<LineChart {data} showArea showDots={false} height={200} />
```

## Bar Chart

```svelte
<script lang="ts">
	import { BarChart } from "$lib/components/ui/chart";

	const data = [
		{ date: "2024-01", value: 1200 },
		{ date: "2024-02", value: 1800 },
		{ date: "2024-03", value: 1500 },
		{ date: "2024-04", value: 2200 },
	];
</script>

<BarChart {data} granularity="month" />
```

### Props Bar Chart

| Prop          | Type                                         | Default                       |
| ------------- | -------------------------------------------- | ----------------------------- |
| `data`        | `{ date: string \| Date; value: number }[]`  | `[]`                          |
| `height`      | `number`                                     | `300`                         |
| `granularity` | `"day"` \| `"week"` \| `"month"` \| `"year"` | `"day"`                       |
| `color`       | `string`                                     | `"hsl(var(--color-primary))"` |
| `barRadius`   | `number`                                     | `4`                           |

## Warna Kustom

```svelte
<LineChart {data} color="hsl(var(--color-destructive))" />
<BarChart {data} color="#22c55e" />
```

## Internal

Grafik menyertakan utilitas bawaan:

- `scale.ts` — `linearScale()`, `timeScale()`, `niceYTicks()` untuk memetakan data ke koordinat SVG
- `format.ts` — `formatDate()`, `formatNumber()` untuk label sumbu dan tooltip (ringkas: 1200 → "1.2k")
- `tooltip.svelte` — tooltip yang disematkan SVG dengan styling popover
