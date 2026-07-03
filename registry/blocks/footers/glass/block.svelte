<script lang="ts">
	const cols: Record<string, string[]> = {
		Product: ["Features", "Pricing", "Integrations", "Changelog"],
		Company: ["About", "Careers", "Blog", "Contact"],
		Resources: ["Docs", "Guides", "Support", "Status"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="relative w-full overflow-hidden bg-muted px-6 py-14">
	<div
		class="pointer-events-none absolute -right-10 top-0 h-56 w-72 rounded-full bg-primary/25 blur-3xl"
		aria-hidden="true"
	></div>

	<div
		class="relative mx-auto w-full max-w-6xl rounded-2xl border border-border/50 bg-card/60 p-8 backdrop-blur-xl sm:p-10"
	>
		<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
			<div>
				<a href="##" class="flex items-center gap-2.5" aria-label="__BRAND__ home">
					<span
						class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
						>B</span
					>
					<span class="font-display text-lg font-extrabold tracking-tight text-foreground"
						>__BRAND__</span
					>
				</a>
				<p class="mt-3.5 max-w-[34ch] text-sm text-muted-foreground">
					A translucent, theme-aware footer that reads over any backdrop.
				</p>
			</div>

			{#each Object.entries(cols) as [heading, links] (heading)}
				<div>
					<h5 class="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
						{heading}
					</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
							>{link}</a
						>
					{/each}
				</div>
			{/each}
		</div>

		<div
			class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-6 text-sm text-muted-foreground"
		>
			<span>© {year} __BRAND__. All rights reserved.</span>
			<span class="flex gap-[18px]">
				<a href="##" class="transition-colors hover:text-foreground">Privacy</a>
				<a href="##" class="transition-colors hover:text-foreground">Terms</a>
			</span>
		</div>
	</div>
</footer>
