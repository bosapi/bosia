<script lang="ts">
	import { ChevronDown } from "@lucide/svelte";

	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts", caret: true },
		{ label: "Themes", caret: true },
		{ label: "Pricing" },
	];
</script>

<header
	class="relative flex h-16 w-full items-center justify-between overflow-hidden border-b border-background/10 bg-gradient-to-r from-foreground via-foreground to-foreground/90 px-6 text-background"
>
	<div
		class="pointer-events-none absolute left-1/3 top-0 h-32 w-72 rounded-full bg-primary/25 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative flex items-center gap-8">
		<a href="/" class="flex items-center gap-2.5">
			<div
				class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-lg font-extrabold tracking-tight">Brand</span>
		</a>
		<nav class="hidden items-center gap-7 md:flex">
			{#each links as link (link.label)}
				<a
					href="/"
					class="relative inline-flex items-center gap-1.5 text-sm font-medium {link.active
						? 'text-background'
						: 'text-background/60 hover:text-background'}"
				>
					{link.label}
					{#if link.caret}<ChevronDown size={14} class="opacity-70" />{/if}
					{#if link.active}
						<span class="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary"></span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<div class="relative flex items-center gap-2.5">
		<span
			class="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-wide text-primary"
			>Beta</span
		>
		<button
			type="button"
			class="rounded-md border border-background/30 px-4 py-2 text-sm font-semibold text-background hover:bg-background/10"
			>Sign in</button
		>
		<button
			type="button"
			class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>Start free</button
		>
	</div>
</header>
