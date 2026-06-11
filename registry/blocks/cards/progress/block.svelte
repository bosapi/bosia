<script lang="ts">
	const items = [
		{ label: "Design", value: 92, bar: "bg-primary" },
		{ label: "Engineering", value: 64, bar: "bg-blue-500" },
		{ label: "QA", value: 38, bar: "bg-amber-500" },
	];

	// Ring geometry: size 52, stroke 6.
	const r = 23;
	const c = 2 * Math.PI * r;
	const ring = 68;
</script>

<div
	class="flex w-full max-w-[260px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md"
>
	<div class="mb-4 flex items-center justify-between">
		<span class="font-display text-[17px] font-bold">Sprint 24</span>
		<div class="relative h-[52px] w-[52px] flex-none">
			<svg width="52" height="52" class="-rotate-90">
				<circle cx="26" cy="26" {r} fill="none" class="stroke-muted" stroke-width="6" />
				<circle
					cx="26"
					cy="26"
					{r}
					fill="none"
					class="stroke-primary"
					stroke-width="6"
					stroke-linecap="round"
					stroke-dasharray={c}
					stroke-dashoffset={c * (1 - ring / 100)}
				/>
			</svg>
			<span
				class="absolute inset-0 flex items-center justify-center font-display text-xs font-bold"
			>
				{ring}%
			</span>
		</div>
	</div>

	<div class="flex flex-col gap-3">
		{#each items as it (it.label)}
			<div>
				<div class="mb-1.5 flex justify-between text-xs">
					<span class="font-medium text-muted-foreground">{it.label}</span>
					<span class="font-mono font-semibold">{it.value}%</span>
				</div>
				<div class="h-[7px] rounded-full bg-muted">
					<div class="h-full rounded-full {it.bar}" style="width: {it.value}%"></div>
				</div>
			</div>
		{/each}
	</div>
</div>
