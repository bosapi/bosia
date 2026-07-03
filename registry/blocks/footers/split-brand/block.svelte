<script lang="ts">
	const cols: Record<string, string[]> = {
		Product: ["Features", "Pricing", "Docs", "Changelog"],
		Company: ["About", "Careers", "Blog", "Contact"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-border bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 pb-8 pt-16">
		<div class="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
			<div>
				<a
					href="##"
					class="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl"
					aria-label="__BRAND__ home">__BRAND__</a
				>
				<p class="mt-4 max-w-sm text-muted-foreground">
					Start building today. Ship the product your team has been imagining.
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<button
						type="button"
						class="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
						>Get started</button
					>
					<button
						type="button"
						class="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
						>Book a demo</button
					>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-8 lg:justify-items-end">
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
		</div>

		<div
			class="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7 text-sm text-muted-foreground"
		>
			<span>© {year} __BRAND__, Inc. All rights reserved.</span>
			<span class="flex gap-[18px]">
				<a href="##" class="transition-colors hover:text-foreground">Privacy</a>
				<a href="##" class="transition-colors hover:text-foreground">Terms</a>
			</span>
		</div>
	</div>
</footer>
