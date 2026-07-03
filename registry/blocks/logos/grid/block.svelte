<script lang="ts">
	// Fictional styled-text wordmarks — no real trademarks.
	const logos = ["Northwind", "Fathom", "Lumen", "Drift", "Vela", "Kite", "Arcadia", "Nimbus"];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<p class="text-center text-sm font-medium text-muted-foreground">
			Powering thousands of teams, from startups to the enterprise
		</p>
		<div
			class="mt-10 grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-2xl border border-border sm:grid-cols-4"
		>
			{#each logos as logo (logo)}
				<div class="flex items-center justify-center px-6 py-10">
					<span
						class="font-display text-lg font-bold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
						>{logo}</span
					>
				</div>
			{/each}
		</div>
	</div>
</section>
