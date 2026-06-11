<script lang="ts">
	import { Check } from "@lucide/svelte";

	const stats = [
		["2.4k", "Followers"],
		["318", "Following"],
		["64", "Shots"],
	];
	let following = $state(false);
</script>

<div
	class="flex w-full max-w-[260px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="h-16 bg-gradient-to-r from-primary to-primary/60"></div>
	<div class="-mt-7 px-[18px] pb-[18px]">
		<span
			class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 font-display text-xl font-bold text-primary shadow-[0_0_0_2px_hsl(var(--card)),0_0_0_4px_hsl(var(--primary))]"
		>
			AR
		</span>
		<div class="mt-2.5">
			<div class="font-display text-lg font-bold">Ana Ruiz</div>
			<div class="mt-0.5 text-[13px] text-muted-foreground">Product Designer · Lisbon</div>
		</div>
		<p class="my-2.5 text-[13px] leading-relaxed text-muted-foreground">
			Designing calm interfaces and the occasional deck. Cards are my love language.
		</p>
		<div class="mb-3.5 flex gap-[18px]">
			{#each stats as [n, l] (l)}
				<div>
					<div class="font-display text-base font-bold">{n}</div>
					<div class="text-[11px] text-muted-foreground/70">{l}</div>
				</div>
			{/each}
		</div>
		<button
			type="button"
			onclick={() => (following = !following)}
			class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition {following
				? 'border border-input bg-transparent text-foreground hover:bg-secondary'
				: 'bg-primary text-primary-foreground hover:brightness-110'}"
		>
			{#if following}
				<Check size={15} /> Following
			{:else}
				Follow
			{/if}
		</button>
	</div>
</div>
