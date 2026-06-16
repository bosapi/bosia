<script lang="ts">
	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts" },
		{ label: "Themes" },
		{ label: "Docs" },
	];
</script>

<div class="flex w-full justify-center bg-transparent px-6 py-4">
	<header
		class="flex h-14 items-center gap-5 rounded-full border border-border bg-card pl-5 pr-3 text-card-foreground shadow-lg"
	>
		<a href="/" class="flex items-center gap-2">
			<div
				class="grid h-6 w-6 place-items-center rounded-md bg-primary font-display text-sm font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-base font-extrabold tracking-tight">Brand</span>
		</a>
		<span class="h-5 w-px bg-border"></span>
		<nav class="hidden items-center gap-5 sm:flex">
			{#each links as link (link.label)}
				<a
					href="/"
					class="text-sm font-medium {link.active
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'}">{link.label}</a
				>
			{/each}
		</nav>
		<button
			type="button"
			class="rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>Get started</button
		>
	</header>
</div>
