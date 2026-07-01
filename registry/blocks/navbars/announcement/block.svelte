<script lang="ts">
	import { ArrowRight, X } from "@lucide/svelte";

	let show = $state(true);

	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts" },
		{ label: "Themes" },
		{ label: "Pricing" },
	];
</script>

<div class="w-full">
	{#if show}
		<div
			class="relative flex h-10 items-center justify-center gap-3 bg-foreground px-6 text-sm text-background"
		>
			<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
			<span>New: a fresh batch of glass navbars just landed.</span>
			<a href="/" class="inline-flex items-center gap-1 font-semibold text-primary">
				Browse them <ArrowRight size={14} />
			</a>
			<button
				type="button"
				onclick={() => (show = false)}
				class="absolute right-4 text-background/60 hover:text-background"
				aria-label="Dismiss"><X size={16} /></button
			>
		</div>
	{/if}

	<header
		class="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 text-card-foreground"
	>
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
	</header>
</div>
