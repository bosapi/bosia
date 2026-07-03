<script lang="ts">
	const links = ["Features", "Pricing", "Docs", "Blog", "Careers", "Contact"];
	// Brand glyphs as inline paths — Lucide v1 no longer ships social/brand icons.
	const socials = [
		{
			label: "X",
			path: "M18.9 2H22l-6.9 7.9L23 22h-6.4l-5-6.5L5.8 22H2.7l7.4-8.4L1.6 2h6.6l4.5 6 5.6-6Zm-1.1 18h1.8L7.3 3.8H5.4L17.8 20Z",
		},
		{
			label: "GitHub",
			path: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
		},
		{
			label: "LinkedIn",
			path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44v6.3ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.53C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.73C24 .77 23.2 0 22.22 0Z",
		},
	];
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-border bg-background">
	<div class="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-16 text-center">
		<a href="##" class="flex flex-col items-center gap-3" aria-label="__BRAND__ home">
			<span
				class="grid h-11 w-11 place-items-center rounded-xl bg-primary font-display text-xl font-extrabold text-primary-foreground"
				>B</span
			>
			<span class="font-display text-2xl font-extrabold tracking-tight text-foreground"
				>__BRAND__</span
			>
		</a>
		<p class="mt-3 max-w-md text-sm text-muted-foreground">
			Everything you need to design, build and ship — in one thoughtful toolkit.
		</p>

		<nav class="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
			{#each links as link (link)}
				<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>{link}</a
				>
			{/each}
		</nav>

		<div class="mt-8 flex gap-2.5">
			{#each socials as { label, path } (label)}
				<a
					href="##"
					class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
					aria-label={label}
				>
					<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d={path} />
					</svg>
				</a>
			{/each}
		</div>

		<span class="mt-10 text-sm text-muted-foreground">© {year} __BRAND__. All rights reserved.</span
		>
	</div>
</footer>
