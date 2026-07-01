<script lang="ts">
	const util = ["Components", "Templates", "Changelog", "Status"];
	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts" },
		{ label: "Themes" },
		{ label: "Pricing" },
	];
</script>

<header class="w-full border-b border-border bg-card text-card-foreground">
	<div class="flex h-9 items-center justify-between border-b border-border bg-muted px-6">
		<span class="font-mono text-xs tracking-wide text-muted-foreground"
			>Components · updated weekly</span
		>
		<nav class="hidden items-center gap-5 sm:flex">
			{#each util as u (u)}
				<a
					href="/"
					class="font-mono text-xs tracking-wide text-muted-foreground hover:text-foreground">{u}</a
				>
			{/each}
		</nav>
	</div>

	<div class="flex items-center justify-between px-6" style="height:60px">
		<a href="/" class="flex items-center gap-2.5">
			<div
				class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
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
		<button
			type="button"
			class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>Get started</button
		>
	</div>
</header>
