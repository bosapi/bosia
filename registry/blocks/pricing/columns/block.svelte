<script lang="ts">
	import { Check } from "@lucide/svelte";

	const tiers = [
		{
			name: "Starter",
			price: "$0",
			period: "/ month",
			blurb: "For side projects and getting started.",
			features: ["Up to 3 projects", "Community support", "1 GB storage", "Basic analytics"],
			cta: "Start for free",
			featured: false,
		},
		{
			name: "Pro",
			price: "$24",
			period: "/ month",
			blurb: "For growing teams that ship often.",
			features: [
				"Unlimited projects",
				"Priority support",
				"50 GB storage",
				"Advanced analytics",
				"Custom domains",
			],
			cta: "Start free trial",
			featured: true,
		},
		{
			name: "Enterprise",
			price: "Custom",
			period: "",
			blurb: "For organisations with scale and controls.",
			features: ["SSO & SAML", "Dedicated support", "Unlimited storage", "Audit logs", "SLA"],
			cta: "Contact sales",
			featured: false,
		},
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Pricing</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Simple, transparent pricing
			</h2>
			<p class="mt-3 text-lg text-muted-foreground">
				Start free and upgrade as you grow. No hidden fees, cancel anytime.
			</p>
		</div>

		<div class="mt-14 grid items-start gap-6 lg:grid-cols-3">
			{#each tiers as tier (tier.name)}
				<div
					class="flex flex-col rounded-2xl bg-card p-7 text-card-foreground shadow-sm {tier.featured
						? 'border-[1.5px] border-primary lg:-translate-y-3 lg:shadow-lg'
						: 'border border-border'}"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-display text-lg font-bold">{tier.name}</h3>
						{#if tier.featured}
							<span
								class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary"
								>Most popular</span
							>
						{/if}
					</div>
					<div class="mt-4 flex items-baseline gap-1">
						<span class="font-display text-4xl font-extrabold tracking-tight">{tier.price}</span>
						<span class="text-sm text-muted-foreground">{tier.period}</span>
					</div>
					<p class="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>
					<ul class="mt-6 flex flex-1 flex-col gap-3">
						{#each tier.features as feature (feature)}
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
						class="mt-7 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition {tier.featured
							? 'bg-primary text-primary-foreground hover:brightness-110'
							: 'border border-input text-foreground hover:bg-secondary'}"
					>
						{tier.cta}
					</button>
				</div>
			{/each}
		</div>
	</div>
</section>
