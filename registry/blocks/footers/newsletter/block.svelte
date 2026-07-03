<script lang="ts">
	const cols: Record<string, string[]> = {
		Product: ["Features", "Pricing", "Integrations", "Changelog"],
		Company: ["About", "Careers", "Blog", "Contact"],
		Legal: ["Privacy", "Terms", "Security", "Cookies"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-border bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 pb-8 pt-14 sm:pt-16">
		<div
			class="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<h4 class="font-display text-xl font-bold tracking-tight text-foreground">
					Stay in the loop
				</h4>
				<p class="mt-1 text-sm text-muted-foreground">
					Product updates and the occasional deep dive. No spam, ever.
				</p>
			</div>
			<form class="flex w-full max-w-sm gap-2" onsubmit={(e) => e.preventDefault()}>
				<input
					type="email"
					required
					placeholder="you@company.com"
					class="h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
				/>
				<button
					type="submit"
					class="h-11 shrink-0 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
					>Subscribe</button
				>
			</form>
		</div>

		<div class="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
			<a href="##" class="flex items-center gap-2.5" aria-label="__BRAND__ home">
				<span
					class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
					>B</span
				>
				<span class="font-display text-lg font-extrabold tracking-tight text-foreground"
					>__BRAND__</span
				>
			</a>
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

		<div class="mt-10 border-t border-border pt-7 text-sm text-muted-foreground">
			© {year} __BRAND__, Inc. All rights reserved.
		</div>
	</div>
</footer>
