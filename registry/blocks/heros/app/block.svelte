<script lang="ts">
	import { ArrowRight, Sparkles, Check, Star } from "@lucide/svelte";

	const features = [
		{ icon: Sparkles, title: "Auto-categorized spending", sub: "Smart rules learn how you spend" },
		{ icon: Check, title: "Bills predicted ahead", sub: "See what’s due before it lands" },
	];
	const rows = [
		{ label: "Groceries", amount: "-$84.20", up: false },
		{ label: "Salary", amount: "+$3,200", up: true },
		{ label: "Subscriptions", amount: "-$48.00", up: false },
		{ label: "Dining out", amount: "-$36.50", up: false },
	];
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-14"
	>
		<!-- Copy -->
		<div class="max-w-xl">
			<div
				class="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-primary"></span> Personal finance, finally calm
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Every account, one <span class="text-primary">honest</span> number.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Connect your banks and watch the noise turn into a plan. Budgets that adjust, bills that
				never surprise you.
			</p>
			<div class="mt-6 flex flex-col gap-4">
				{#each features as feature (feature.title)}
					{@const Icon = feature.icon}
					<div class="flex items-start gap-3">
						<span
							class="grid h-9 w-9 flex-none place-items-center rounded-xl bg-primary/10 text-primary"
						>
							<Icon size={19} />
						</span>
						<div>
							<div class="text-sm font-bold leading-tight">{feature.title}</div>
							<div class="text-sm text-muted-foreground">{feature.sub}</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-7 flex flex-wrap items-center gap-4">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					<ArrowRight size={19} /> Get the app
				</button>
				<span class="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Star size={15} class="fill-amber-500 text-amber-500" />
					<span class="font-semibold text-foreground">4.8</span> 18k ratings
				</span>
			</div>
		</div>

		<!-- Phone mock -->
		<div class="flex items-center justify-center">
			<div
				class="relative h-[600px] max-h-[78vh] w-[300px] rounded-[44px] bg-foreground p-3 shadow-xl"
			>
				<div
					class="absolute left-1/2 top-4 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-foreground"
				></div>
				<div class="h-full w-full overflow-hidden rounded-[34px] bg-background">
					<div class="px-5 pb-4 pt-12">
						<div class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
							Total balance
						</div>
						<div class="mt-1 font-display text-4xl font-extrabold">$12,480</div>
						<span
							class="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
							>+$420 this week</span
						>
					</div>
					<div class="flex flex-col gap-2 px-3.5">
						{#each rows as row (row.label)}
							<div class="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 shadow-sm">
								<span class="h-8 w-8 flex-none rounded-lg bg-primary/15"></span>
								<span class="flex-1 text-sm font-semibold">{row.label}</span>
								<span
									class="text-sm font-bold {row.up
										? 'text-emerald-600 dark:text-emerald-400'
										: 'text-foreground'}">{row.amount}</span
								>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
