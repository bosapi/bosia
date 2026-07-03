<script lang="ts">
	// Fictional styled-text wordmarks — no real trademarks.
	const logos = ["Northwind", "Fathom", "Lumen", "Drift", "Vela", "Kite"];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16">
		<p class="text-center text-sm font-medium text-muted-foreground">
			Trusted by fast-moving teams worldwide
		</p>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
			{#each logos as logo (logo)}
				<span
					class="font-display text-xl font-bold tracking-tight text-muted-foreground/60 grayscale transition-colors hover:text-foreground"
					>{logo}</span
				>
			{/each}
		</div>
	</div>
</section>
