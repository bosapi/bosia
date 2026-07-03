<script lang="ts">
	const links = ["Features", "Pricing", "Docs", "Blog", "Contact"];
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-border bg-background">
	<div
		class="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:justify-between"
	>
		<a
			href="##"
			class="font-display text-lg font-extrabold tracking-tight text-foreground"
			aria-label="__BRAND__ home">__BRAND__</a
		>
		<nav class="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
			{#each links as link (link)}
				<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>{link}</a
				>
			{/each}
		</nav>
		<span class="text-sm text-muted-foreground">© {year} __BRAND__</span>
	</div>
</footer>
