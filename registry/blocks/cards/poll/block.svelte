<script lang="ts">
	const opts = [
		{ label: "Midnight", pct: 46 },
		{ label: "Paper", pct: 31 },
		{ label: "Bloom", pct: 23 },
	];
	let pick = $state(0);
</script>

<div
	class="flex w-full max-w-[270px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md"
>
	<span
		class="mb-2.5 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary"
	>
		Live poll
	</span>
	<div class="mb-3.5 font-display text-[16.5px] font-bold">Favourite theme?</div>
	<div class="flex flex-col gap-2.5">
		{#each opts as opt, i (opt.label)}
			<button
				type="button"
				onclick={() => (pick = i)}
				class="relative overflow-hidden rounded-lg bg-secondary px-3 py-2.5 text-left {i === pick
					? 'border-[1.5px] border-primary'
					: 'border border-border'}"
			>
				<span
					class="absolute inset-y-0 left-0 transition-[width] duration-500 {i === pick
						? 'bg-primary/10'
						: 'bg-muted'}"
					style="width: {opt.pct}%"
				></span>
				<span class="relative flex justify-between text-[13.5px]">
					<span class="font-semibold">{opt.label}</span>
					<span class="font-mono {i === pick ? 'text-primary' : 'text-muted-foreground'}">
						{opt.pct}%
					</span>
				</span>
			</button>
		{/each}
	</div>
	<div class="mt-3 text-[11.5px] text-muted-foreground/70">1,284 votes · 2h left</div>
</div>
