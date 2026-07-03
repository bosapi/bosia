<script lang="ts">
	import { Users, DollarSign, Activity, Star } from "@lucide/svelte";

	const stats = [
		{ icon: Users, value: "48,200", label: "Active users", delta: "+12.4%" },
		{ icon: DollarSign, value: "$1.2M", label: "Monthly revenue", delta: "+8.1%" },
		{ icon: Activity, value: "99.99%", label: "Uptime", delta: "+0.02%" },
		{ icon: Star, value: "4.9/5", label: "Customer rating", delta: "+0.3" },
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each stats as stat (stat.label)}
				<div class="rounded-2xl border border-border bg-card p-6 text-card-foreground">
					<div class="flex items-center justify-between">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<stat.icon size={20} />
						</span>
						<span
							class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary"
							>{stat.delta}</span
						>
					</div>
					<div class="mt-4 font-display text-3xl font-extrabold tracking-tight tabular-nums">
						{stat.value}
					</div>
					<div class="mt-1 text-sm text-muted-foreground">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
