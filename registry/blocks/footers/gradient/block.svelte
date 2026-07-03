<script lang="ts">
	const links = ["Features", "Pricing", "Docs", "Blog", "Careers", "Contact"];
	const year = new Date().getFullYear();
</script>

<footer
	class="relative w-full overflow-hidden bg-gradient-to-b from-foreground to-foreground/90 text-background/70"
>
	<div
		class="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto w-full max-w-6xl px-6 pb-8 pt-16">
		<div class="flex flex-col items-center text-center">
			<a
				href="##"
				class="font-display text-lg font-extrabold tracking-tight text-background"
				aria-label="__BRAND__ home">__BRAND__</a
			>
			<h3
				class="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-background sm:text-4xl"
			>
				Ready to build something great?
			</h3>
			<p class="mt-3 max-w-md text-background/60">
				Join thousands of teams shipping faster with __BRAND__.
			</p>
			<button
				type="button"
				class="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
				>Get started free</button
			>
		</div>

		<div
			class="mt-14 flex flex-col items-center gap-5 border-t border-background/10 pt-7 sm:flex-row sm:justify-between"
		>
			<nav class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
				{#each links as link (link)}
					<a href="##" class="text-sm text-background/70 transition-colors hover:text-background"
						>{link}</a
					>
				{/each}
			</nav>
			<span class="text-[13px] text-background/60">© {year} __BRAND__, Inc.</span>
		</div>
	</div>
</footer>
