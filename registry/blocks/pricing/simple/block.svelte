<script lang="ts">
	import { Check } from "@lucide/svelte";

	const features = [
		"Unlimited projects",
		"Priority support",
		"50 GB storage",
		"Advanced analytics",
		"Custom domains",
		"Team roles & permissions",
	];

	let yearly = $state(false);
	const price = $derived(yearly ? 20 : 24);
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto flex max-w-lg flex-col items-center text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Pricing</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				One plan, everything included
			</h2>

			<div class="mt-6 inline-flex rounded-full border border-border bg-muted/50 p-1">
				<button
					type="button"
					onclick={() => (yearly = false)}
					class="rounded-full px-4 py-1.5 text-sm font-semibold transition {!yearly
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'}">Monthly</button
				>
				<button
					type="button"
					onclick={() => (yearly = true)}
					class="rounded-full px-4 py-1.5 text-sm font-semibold transition {yearly
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'}">Yearly · save 15%</button
				>
			</div>
		</div>

		<div
			class="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm sm:p-10"
		>
			<div class="flex items-baseline justify-center gap-1">
				<span class="font-display text-6xl font-extrabold tracking-tight tabular-nums"
					>${price}</span
				>
				<span class="text-muted-foreground">/ seat / month</span>
			</div>
			<p class="mt-2 text-center text-sm text-muted-foreground">
				{yearly ? "Billed annually" : "Billed monthly"} · cancel anytime
			</p>

			<ul class="mt-8 grid gap-3 sm:grid-cols-2">
				{#each features as feature (feature)}
					<li class="flex items-center gap-2.5 text-sm">
						<span
							class="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<Check size={12} />
						</span>
						{feature}
					</li>
				{/each}
			</ul>

			<button
				type="button"
				class="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
				>Start your free trial</button
			>
		</div>
	</div>
</section>
