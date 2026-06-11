<script lang="ts">
	const bars = [42, 58, 50, 71, 63, 88, 76];
	const days = ["M", "T", "W", "T", "F", "S", "S"];
	const max = Math.max(...bars);
	const ranges = ["7D", "30D"];
	let active = $state(0);
</script>

<div
	class="flex w-full max-w-[300px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-start justify-between">
		<div>
			<span class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
				Weekly active
			</span>
			<div class="mt-1 font-display text-3xl font-extrabold tabular-nums tracking-tight">
				18,204
			</div>
		</div>
		<div class="flex gap-1 rounded-lg bg-muted p-[3px]">
			{#each ranges as t, i (t)}
				<button
					type="button"
					onclick={() => (active = i)}
					class="rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition {active === i
						? 'bg-card text-foreground shadow-sm'
						: 'text-muted-foreground/70'}"
				>
					{t}
				</button>
			{/each}
		</div>
	</div>

	<div class="mt-5">
		<div class="flex h-16 items-end gap-1.5">
			{#each bars as v, i (i)}
				<div
					class="flex-1 rounded-sm {i === bars.length - 2
						? 'bg-primary'
						: 'bg-muted shadow-[inset_0_0_0_1px_hsl(var(--border))]'}"
					style="height: {(v / max) * 100}%; min-height: 4px"
				></div>
			{/each}
		</div>
		<div class="mt-2 flex justify-between">
			{#each days as d, i (i)}
				<span class="font-mono text-[11px] text-muted-foreground/70">{d}</span>
			{/each}
		</div>
	</div>
</div>
