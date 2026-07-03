<script lang="ts">
	const cols: Record<string, string[]> = {
		Product: ["Features", "Pricing", "Docs", "Changelog"],
		Company: ["About", "Careers", "Blog", "Contact"],
		Social: ["X / Twitter", "GitHub", "LinkedIn", "YouTube"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t-4 border-foreground bg-primary text-primary-foreground">
	<div class="mx-auto w-full max-w-6xl px-6 py-14">
		<div
			class="flex flex-col justify-between gap-4 border-b-4 border-primary-foreground pb-8 sm:flex-row sm:items-end"
		>
			<span class="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl"
				>__BRAND__</span
			>
			<button
				type="button"
				class="self-start border-4 border-primary-foreground bg-background px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-foreground shadow-[6px_6px_0_rgba(0,0,0,0.25)] sm:self-auto"
				>Start now →</button
			>
		</div>

		<div class="grid gap-8 pt-8 sm:grid-cols-3">
			{#each Object.entries(cols) as [heading, links] (heading)}
				<div class="border-2 border-primary-foreground p-5">
					<h5 class="mb-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">{heading}</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1 font-mono text-sm font-bold uppercase tracking-wide underline-offset-4 hover:underline"
							>{link}</a
						>
					{/each}
				</div>
			{/each}
		</div>

		<div class="mt-8 flex flex-wrap items-center gap-4 font-mono text-xs font-bold uppercase">
			<span class="border-2 border-primary-foreground px-3 py-1.5">© {year} __BRAND__</span>
			<a href="##" class="underline-offset-4 hover:underline">Privacy</a>
			<a href="##" class="underline-offset-4 hover:underline">Terms</a>
		</div>
	</div>
</footer>
