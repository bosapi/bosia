<script lang="ts">
	import { Zap, Shield, Layers, LineChart, Puzzle, Globe } from "@lucide/svelte";

	const features = [
		{
			icon: Zap,
			title: "Lightning fast",
			body: "Built on a modern edge runtime so every page loads in milliseconds, everywhere.",
		},
		{
			icon: Shield,
			title: "Secure by default",
			body: "Encryption in transit and at rest, with SSO and audit logs on every enterprise plan.",
		},
		{
			icon: Layers,
			title: "Composable",
			body: "Mix and match building blocks. Nothing is locked down — shape it to your workflow.",
		},
		{
			icon: LineChart,
			title: "Insightful analytics",
			body: "See exactly what your users do, with dashboards you can share across the team.",
		},
		{
			icon: Puzzle,
			title: "Integrates with everything",
			body: "Connect the tools you already use through a growing library of integrations.",
		},
		{
			icon: Globe,
			title: "Global scale",
			body: "Serve customers on every continent from a network built to handle the load.",
		},
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Features</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Everything you need to ship
			</h2>
			<p class="mt-3 text-lg text-muted-foreground">
				A complete toolkit that grows with your team, from first commit to global scale.
			</p>
		</div>

		<div class="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				<div class="flex flex-col">
					<span
						class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
					>
						<feature.icon size={22} />
					</span>
					<h3 class="mt-4 font-display text-lg font-bold">{feature.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
