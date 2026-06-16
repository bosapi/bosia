<script lang="ts">
	const left = [{ label: "Browse" }, { label: "Layouts" }, { label: "Trending", active: true }];
	const right = [{ label: "Themes" }, { label: "Docs" }, { label: "Pricing" }];
</script>

<header
	class="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 text-card-foreground"
>
	<nav class="hidden flex-1 items-center gap-6 md:flex">
		{#each left as link (link.label)}
			<a
				href="/"
				class="relative text-sm font-medium {link.active
					? 'text-foreground'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				{link.label}
				{#if link.active}
					<span class="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary"></span>
				{/if}
			</a>
		{/each}
	</nav>

	<a href="/" class="flex items-center gap-2.5">
		<div
			class="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
		>
			B
		</div>
		<span class="font-display text-xl font-extrabold tracking-tight">Brand</span>
	</a>

	<div class="hidden flex-1 items-center justify-end gap-6 md:flex">
		<nav class="flex items-center gap-6">
			{#each right as link (link.label)}
				<a href="/" class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>{link.label}</a
				>
			{/each}
		</nav>
		<button
			type="button"
			class="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>Sign up</button
		>
	</div>
</header>
