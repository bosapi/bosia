<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import Tooltip from "./tooltip.svelte";
    import { linearScale, timeScale, niceYTicks, toDates } from "./scale.ts";
    import { formatDate, formatDateFull, formatNumber, type Granularity } from "./format.ts";

    let {
        class: className = "",
        data = [] as { date: string | Date; value: number }[],
        height = 300,
        granularity = "day" as Granularity,
        color = "var(--color-primary)",
        showArea = false,
        showDots = true,
        ...restProps
    }: {
        class?: string;
        data?: { date: string | Date; value: number }[];
        height?: number;
        granularity?: Granularity;
        color?: string;
        showArea?: boolean;
        showDots?: boolean;
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

        const minDate = dates[0]!;
        const maxDate = dates[dates.length - 1]!;
        const maxVal = Math.max(...values, 0);

        const xScale = timeScale(minDate, maxDate, 0, PLOT_W);
        const yTicks = niceYTicks(0, maxVal, 5);
        const yMax = yTicks[yTicks.length - 1] ?? maxVal;
        const yScale = linearScale(0, yMax, PLOT_H, 0);

        const points = data.map((d, i) => ({
            x: dates.length === 1 ? PLOT_W / 2 : xScale(dates[i]!),
            y: yScale(d.value),
            date: dates[i]!,
            value: d.value,
        }));

        const lastPoint = points[points.length - 1]!;

        // Thin x labels to max 8
        const step = Math.ceil(dates.length / 8);
        const xLabels = dates
            .map((date, i) => ({
                x: dates.length === 1 ? PLOT_W / 2 : xScale(date),
                label: formatDate(date, granularity),
                i,
            }))
            .filter((xl) => xl.i % step === 0 || xl.i === dates.length - 1);

        const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
        const areaPoints = [
            `0,${PLOT_H}`,
            ...points.map((p) => `${p.x},${p.y}`),
            `${lastPoint.x},${PLOT_H}`,
        ].join(" ");

        return { points, yTicks, yScale, xLabels, linePoints, areaPoints };
    });

    let tooltip = $state({ visible: false, x: 0, y: 0, label: "", value: "" });
</script>

<svg
    viewBox="0 0 {SVG_W} {SVG_H}"
    width="100%"
    height={SVG_H}
    class={cn("overflow-visible", className)}
    aria-label="Line chart"
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

            {#each prepared.xLabels as xl}
                <text x={xl.x} y={PLOT_H + 20} text-anchor="middle" font-size="10" fill="currentColor" fill-opacity="0.45">{xl.label}</text>
            {/each}

            {#if showArea}
                <polygon points={prepared.areaPoints} fill={color} fill-opacity="0.12" />
            {/if}

            <polyline points={prepared.linePoints} fill="none" stroke={color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

            {#each prepared.points as pt}
                <circle
                    cx={pt.x} cy={pt.y} r="12" fill="transparent"
                    role="graphics-symbol"
                    aria-label="{formatDateFull(pt.date)}: {formatNumber(pt.value)}"
                    onmouseenter={() => { tooltip = { visible: true, x: pt.x, y: pt.y, label: formatDateFull(pt.date), value: formatNumber(pt.value) }; }}
                    onmouseleave={() => (tooltip = { ...tooltip, visible: false })}
                />
                {#if showDots}
                    <circle cx={pt.x} cy={pt.y} r="3.5" fill={color} stroke="var(--color-background, white)" stroke-width="1.5" pointer-events="none" />
                {/if}
            {/each}

            <Tooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible} label={tooltip.label} value={tooltip.value} />
        {:else}
            <text x={PLOT_W / 2} y={PLOT_H / 2} text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.35">No data</text>
        {/if}
    </g>
</svg>
