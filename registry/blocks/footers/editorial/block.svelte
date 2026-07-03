<script lang="ts">
	const cols: Record<string, string[]> = {
		Sections: ["Latest", "Features", "Interviews", "Archive"],
		About: ["Masthead", "Ethics", "Careers", "Contact"],
		Follow: ["Newsletter", "X / Twitter", "Instagram", "RSS"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-border bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16">
		<a
			href="##"
			class="block font-serif text-6xl font-medium tracking-tight text-foreground sm:text-7xl"
			aria-label="__BRAND__ home">__BRAND__</a
		>
		<p class="mt-4 max-w-xl font-serif text-lg italic text-muted-foreground">
			A quiet publication about design, craft and the tools we build with.
		</p>

		<div class="mt-12 grid gap-10 border-t border-border pt-10 sm:grid-cols-3">
			{#each Object.entries(cols) as [heading, links] (heading)}
				<div>
					<h5
						class="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
					>
						{heading}
					</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1.5 text-sm uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
							>{link}</a
						>
					{/each}
				</div>
			{/each}
		</div>

		<div
			class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
		>
			<span>© {year} __BRAND__</span>
			<span class="flex gap-6">
				<a href="##" class="transition-colors hover:text-foreground">Privacy</a>
				<a href="##" class="transition-colors hover:text-foreground">Terms</a>
			</span>
		</div>
	</div>
</footer>
