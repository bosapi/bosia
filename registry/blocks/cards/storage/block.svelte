<script lang="ts">
	const parts = [
		{ label: "Documents", gb: 42, bar: "bg-primary", dot: "bg-primary" },
		{ label: "Media", gb: 28, bar: "bg-blue-500", dot: "bg-blue-500" },
		{ label: "Other", gb: 12, bar: "bg-amber-500", dot: "bg-amber-500" },
	];

	// Ring geometry: size 66, stroke 8.
	const r = 29;
	const c = 2 * Math.PI * r;
	const used = 82;
</script>

<div
	class="flex w-full max-w-[260px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md"
>
	<div class="mb-4 flex items-center gap-4">
		<div class="relative h-[66px] w-[66px] flex-none">
			<svg width="66" height="66" class="-rotate-90">
				<circle cx="33" cy="33" {r} fill="none" class="stroke-muted" stroke-width="8" />
				<circle
					cx="33"
					cy="33"
					{r}
					fill="none"
					class="stroke-primary"
					stroke-width="8"
					stroke-linecap="round"
					stroke-dasharray={c}
					stroke-dashoffset={c * (1 - used / 100)}
				/>
			</svg>
			<span
				class="absolute inset-0 flex items-center justify-center font-display text-sm font-bold"
			>
				{used}%
			</span>
		</div>
		<div>
			<div class="font-display text-base font-bold">Storage</div>
			<div class="mt-0.5 text-[13px] text-muted-foreground">
				<b class="text-foreground">164 GB</b> of 200 GB
			</div>
		</div>
	</div>
	<div class="mb-3.5 flex h-2 overflow-hidden rounded-full bg-muted">
		{#each parts as p (p.label)}
			<div class={p.bar} style="width: {p.gb}%"></div>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		{#each parts as p (p.label)}
			<div class="flex items-center gap-2 text-xs">
				<span class="h-[9px] w-[9px] rounded-sm {p.dot}"></span>
				<span class="flex-1 text-muted-foreground">{p.label}</span>
				<span class="font-mono font-semibold">{p.gb} GB</span>
			</div>
		{/each}
	</div>
</div>
