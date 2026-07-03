<script lang="ts">
	const stats = [
		{ value: "10M+", label: "Requests served daily" },
		{ value: "99.99%", label: "Uptime across regions" },
		{ value: "150+", label: "Countries reached" },
		{ value: "4.9/5", label: "Average customer rating" },
	];
</script>

<section class="w-full bg-muted/50">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
		<div class="grid gap-y-10 divide-border sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
			{#each stats as stat (stat.label)}
				<div class="px-4 text-center">
					<div class="font-display text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
						{stat.value}
					</div>
					<div class="mt-2 text-sm text-muted-foreground">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
