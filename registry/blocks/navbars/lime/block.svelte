<script lang="ts">
	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts" },
		{ label: "Themes" },
		{ label: "Pricing" },
	];
</script>

<header
	class="flex h-16 w-full items-center justify-between bg-primary px-6 text-primary-foreground"
>
	<div class="flex items-center gap-8">
		<a href="/" class="flex items-center gap-2.5">
			<div
				class="grid h-8 w-8 place-items-center rounded-lg bg-primary-foreground font-display text-lg font-extrabold text-primary"
			>
				B
			</div>
			<span class="font-display text-lg font-extrabold tracking-tight">__BRAND__</span>
		</a>
		<nav class="hidden items-center gap-7 md:flex">
			{#each links as link (link.label)}
				<a
					href="/"
					class="relative text-sm font-medium {link.active
						? 'text-primary-foreground'
						: 'text-primary-foreground/70 hover:text-primary-foreground'}"
				>
					{link.label}
					{#if link.active}
						<span class="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary-foreground"
						></span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<div class="flex items-center gap-2.5">
		<button
			type="button"
			class="px-3 py-2 text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground"
			>Log in</button
		>
		<button
			type="button"
			class="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
			>Get started</button
		>
	</div>
</header>
