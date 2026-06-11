<script lang="ts">
	import { Check } from "@lucide/svelte";

	const features = ["Unlimited cards", "All 18 themes", "Figma + code export", "Priority support"];
	let { featured = true }: { featured?: boolean } = $props();
</script>

<div
	class="flex w-full max-w-[270px] flex-col rounded-xl bg-card p-6 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg {featured
		? 'border-[1.5px] border-primary'
		: 'border border-border'}"
>
	<div class="flex items-center justify-between">
		<span class="font-display text-[17px] font-bold">Studio</span>
		{#if featured}
			<span
				class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary"
			>
				Popular
			</span>
		{/if}
	</div>
	<div class="mb-1 mt-3.5 flex items-baseline gap-1">
		<span class="font-display text-5xl font-extrabold tracking-tight">$24</span>
		<span class="text-sm text-muted-foreground">/ month</span>
	</div>
	<div class="mb-[18px] text-[13px] text-muted-foreground/70">Billed annually · per seat</div>
	<div class="mb-5 flex flex-col gap-2.5">
		{#each features as f (f)}
			<div class="flex items-center gap-2.5 text-[13.5px]">
				<span
					class="flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<Check size={12} />
				</span>
				{f}
			</div>
		{/each}
	</div>
	<button
		type="button"
		class="inline-flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-[13px] font-semibold transition {featured
			? 'bg-primary text-primary-foreground hover:brightness-110'
			: 'border border-input bg-transparent text-foreground hover:bg-secondary'}"
	>
		Choose Studio
	</button>
</div>
