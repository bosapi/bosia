<script lang="ts">
	const cols: Record<string, string[]> = {
		"~/product": ["features", "pricing", "changelog", "roadmap"],
		"~/docs": ["quickstart", "guides", "api", "cli"],
		"~/company": ["about", "careers", "blog", "contact"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-background/10 bg-foreground font-mono text-background/70">
	<div class="mx-auto w-full max-w-6xl px-6 py-14">
		<a href="##" class="inline-flex items-center gap-2 text-background" aria-label="__BRAND__ home">
			<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
			<span class="text-lg font-bold tracking-tight">__BRAND__</span>
			<span class="inline-block h-4 w-2 animate-pulse bg-primary"></span>
		</a>
		<p class="mt-3 max-w-md text-sm text-background/50">
			<span class="text-primary">$</span> everything you need, one command away.
		</p>

		<div class="mt-10 grid gap-8 sm:grid-cols-3">
			{#each Object.entries(cols) as [heading, links] (heading)}
				<div>
					<h5 class="mb-3 text-xs uppercase tracking-[0.14em] text-background/50">{heading}</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1 text-sm text-background/70 transition-colors hover:text-background"
							><span class="text-primary">&gt;</span> {link}</a
						>
					{/each}
				</div>
			{/each}
		</div>

		<div
			class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-background/10 pt-6 text-xs text-background/50"
		>
			<span>[ © {year} __BRAND__ — all rights reserved ]</span>
			<span class="flex gap-5">
				<a href="##" class="transition-colors hover:text-background">privacy</a>
				<a href="##" class="transition-colors hover:text-background">terms</a>
			</span>
		</div>
	</div>
</footer>
