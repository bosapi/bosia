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

	// native SVG rect/text, not <foreignObject>. Chrome doesn't
	// repaint an old foreignObject's box/shadow when it moves, leaving ghosts.
	const W = 110;
	const H = 44;
	const PAD = 8;
</script>

{#if visible}
	{@const bx = x - W / 2}
	{@const by = y - H - PAD}
	<g pointer-events="none">
		<rect
			x={bx}
			y={by}
			width={W}
			height={H}
			rx="6"
			fill="var(--color-popover, #1e1e2e)"
			stroke="var(--color-border, rgba(255,255,255,0.1))"
		/>
		<text x={bx + 10} y={by + 17} font-size="10" fill="var(--color-muted-foreground, #6c7086)"
			>{label}</text
		>
		<text
			x={bx + 10}
			y={by + 33}
			font-size="13"
			font-weight="600"
			fill="var(--color-popover-foreground, #cdd6f4)">{value}</text
		>
	</g>
{/if}
