<script lang="ts">
    let {
        x = 0,
        y = 0,
        visible = false,
        label = "",
        value = "",
    }: {
        x?: number;
        y?: number;
        visible?: boolean;
        label?: string;
        value?: string;
    } = $props();

    const W = 110;
    const H = 48;
    const PAD = 6;
</script>

{#if visible}
    <foreignObject
        x={x - W / 2}
        y={y - H - PAD}
        width={W}
        height={H}
        style="overflow: visible; pointer-events: none;"
    >
        <div
            style="background: var(--color-popover, #1e1e2e); color: var(--color-popover-foreground, #cdd6f4); border: 1px solid var(--color-border, rgba(255,255,255,0.1)); border-radius: 6px; padding: 5px 9px; font-size: 11px; display: flex; flex-direction: column; gap: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap;"
        >
            <span style="color: var(--color-muted-foreground, #6c7086); font-size: 10px;">{label}</span>
            <span style="font-weight: 600; font-size: 13px;">{value}</span>
        </div>
    </foreignObject>
{/if}
