<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import Tooltip from "./tooltip.svelte";
    import { linearScale, niceYTicks, toDates } from "./scale.ts";
    import { formatDate, formatDateFull, formatNumber, type Granularity } from "./format.ts";

    let {
        class: className = "",
        data = [] as { date: string | Date; value: number }[],
        height = 300,
        granularity = "day" as Granularity,
        color = "var(--color-primary)",
        barRadius = 4,
        ...restProps
    }: {
        class?: string;
        data?: { date: string | Date; value: number }[];
        height?: number;
        granularity?: Granularity;
        color?: string;
        barRadius?: number;
        [key: string]: any;
    } = $props();

    const MARGIN = { top: 12, right: 16, bottom: 36, left: 48 };
    const SVG_W = 600;
    const SVG_H = $derived(height);
    const PLOT_W = SVG_W - MARGIN.left - MARGIN.right;
    const PLOT_H = $derived(SVG_H - MARGIN.top - MARGIN.bottom);

    const prepared = $derived.by(() => {
        if (!data || data.length === 0) return null;

        const dates = toDates(data.map((d) => d.date));
        const values = data.map((d) => d.value);
        const maxVal = Math.max(...values, 0);

        const yTicks = niceYTicks(0, maxVal, 5);
        const yMax = yTicks[yTicks.length - 1] ?? maxVal;
        const yScale = linearScale(0, yMax, PLOT_H, 0);

        const slotW = PLOT_W / (data.length || 1);
        const barW = slotW * 0.75;
        const xOf = (i: number) => i * slotW + slotW / 2;

        const bars = data.map((d, i) => ({
            x: xOf(i) - barW / 2,
            y: yScale(d.value),
            width: barW,
            height: PLOT_H - yScale(d.value),
            cx: xOf(i),
            date: dates[i]!,
            value: d.value,
            label: formatDate(dates[i]!, granularity),
        }));

        const step = Math.ceil(bars.length / 8);
        const xLabels = bars.filter((_, i) => i % step === 0 || i === bars.length - 1);

        return { bars, yTicks, yScale, xLabels };
    });

    let tooltip = $state({ visible: false, x: 0, y: 0, label: "", value: "" });
</script>

<svg
    viewBox="0 0 {SVG_W} {SVG_H}"
    width="100%"
    height={SVG_H}
    class={cn("overflow-visible", className)}
    aria-label="Bar chart"
    role="img"
    {...restProps}
>
    <g transform="translate({MARGIN.left},{MARGIN.top})">
        {#if prepared}
            {#each prepared.yTicks as tick}
                {@const y = prepared.yScale(tick)}
                <line x1={0} y1={y} x2={PLOT_W} y2={y} stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="4 3" />
                <text x={-8} {y} text-anchor="end" dominant-baseline="middle" font-size="10" fill="currentColor" fill-opacity="0.45">{formatNumber(tick)}</text>
            {/each}

            {#each prepared.bars as bar}
                {@const r = Math.min(barRadius, bar.height / 2, bar.width / 2)}
                <path
                    d="M {bar.x + r},{bar.y} H {bar.x + bar.width - r} Q {bar.x + bar.width},{bar.y} {bar.x + bar.width},{bar.y + r} V {bar.y + bar.height} H {bar.x} V {bar.y + r} Q {bar.x},{bar.y} {bar.x + r},{bar.y} Z"
                    fill={color}
                    fill-opacity="0.85"
                    role="graphics-symbol"
                    aria-label="{formatDateFull(bar.date)}: {formatNumber(bar.value)}"
                    onmouseenter={() => { tooltip = { visible: true, x: bar.cx, y: bar.y, label: formatDateFull(bar.date), value: formatNumber(bar.value) }; }}
                    onmouseleave={() => (tooltip = { ...tooltip, visible: false })}
                />
            {/each}

            {#each prepared.xLabels as bar}
                <text x={bar.cx} y={PLOT_H + 20} text-anchor="middle" font-size="10" fill="currentColor" fill-opacity="0.45">{bar.label}</text>
            {/each}

            <Tooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible} label={tooltip.label} value={tooltip.value} />
        {:else}
            <text x={PLOT_W / 2} y={PLOT_H / 2} text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.35">No data</text>
        {/if}
    </g>
</svg>
