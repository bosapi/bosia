---
title: Chart
description: SVG line and bar charts with tooltips — zero dependencies, pure Svelte.
demo: ChartDemo
---

```bash
bosia add chart
```

Pure SVG chart components with tooltips, responsive sizing, and automatic axis formatting. No external charting library needed.

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

### Line Chart Props

| Prop          | Type                                    | Default                       |
| ------------- | --------------------------------------- | ----------------------------- |
| `data`        | `{ date: string \| Date; value: number }[]` | `[]`                     |
| `height`      | `number`                                | `300`                         |
| `granularity` | `"day"` \| `"week"` \| `"month"` \| `"year"` | `"day"`                |
| `color`       | `string`                                | `"hsl(var(--color-primary))"` |
| `showArea`    | `boolean`                               | `false`                       |
| `showDots`    | `boolean`                               | `true`                        |

### Area Chart Variant

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

### Bar Chart Props

| Prop          | Type                                    | Default                       |
| ------------- | --------------------------------------- | ----------------------------- |
| `data`        | `{ date: string \| Date; value: number }[]` | `[]`                     |
| `height`      | `number`                                | `300`                         |
| `granularity` | `"day"` \| `"week"` \| `"month"` \| `"year"` | `"day"`                |
| `color`       | `string`                                | `"hsl(var(--color-primary))"` |
| `barRadius`   | `number`                                | `4`                           |

## Custom Colors

```svelte
<LineChart {data} color="hsl(var(--color-destructive))" />
<BarChart {data} color="#22c55e" />
```

## Internals

Charts include built-in utilities:

- `scale.ts` — `linearScale()`, `timeScale()`, `niceYTicks()` for mapping data to SVG coordinates
- `format.ts` — `formatDate()`, `formatNumber()` for axis labels and tooltips (compact: 1200 → "1.2k")
- `tooltip.svelte` — SVG-embedded tooltip with popover styling
