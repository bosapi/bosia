<script lang="ts">
	interface Segment {
		label: string;
		count: number;
		percent: number;
		tone: "positive" | "neutral" | "negative";
	}

	interface Props {
		segments?: Segment[];
		class?: string;
	}

	let {
		segments = [
			{ label: "Positive", count: 96, percent: 64, tone: "positive" },
			{ label: "Neutral", count: 30, percent: 20, tone: "neutral" },
			{ label: "Negative", count: 24, percent: 16, tone: "negative" },
		],
		class: className = "",
	}: Props = $props();

	// Status colors per bosia-cards: emerald = positive, amber = neutral, red = negative.
	const barTone: Record<Segment["tone"], string> = {
		positive: "bg-emerald-600 dark:bg-emerald-500",
		neutral: "bg-amber-400 dark:bg-amber-500",
		negative: "bg-red-500 dark:bg-red-400",
	};
	const dotTone = barTone;

	const visible = $derived(segments.filter((s) => s.percent > 0 || s.count > 0));
	const ariaLabel = $derived(visible.map((s) => `${s.label} ${s.percent}%`).join(", "));
</script>

<div class={className}>
	<!-- Stacked bar; 2px surface gap between segments -->
	<div class="flex h-5 overflow-hidden rounded-md" role="img" aria-label={ariaLabel}>
		{#each visible as s, i (s.label)}
			{#if i > 0}
				<div class="w-0.5 shrink-0 bg-card"></div>
			{/if}
			<div class={barTone[s.tone]} style="width: {Math.max(s.percent, 0.5)}%"></div>
		{/each}
	</div>
	<div class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
		{#each visible as s (s.label)}
			<span class="flex items-center gap-2">
				<span class="h-2.5 w-2.5 rounded-full {dotTone[s.tone]}"></span>
				{s.label} —
				<span class="font-medium tabular-nums">{s.count} ({s.percent}%)</span>
			</span>
		{/each}
	</div>
</div>
