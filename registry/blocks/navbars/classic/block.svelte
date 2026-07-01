<script lang="ts">
	import { ChevronDown, ArrowUpRight } from "@lucide/svelte";

	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts", caret: true },
		{ label: "Themes", caret: true },
		{ label: "Pricing" },
	];
</script>

<header
	class="relative flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 text-card-foreground"
>
	<a href="/" class="flex items-center gap-2.5">
		<div
			class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
		>
			B
		</div>
		<span class="font-display text-lg font-extrabold tracking-tight">__BRAND__</span>
	</a>

	<nav class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
		{#each links as link (link.label)}
			<a
				href="/"
				class="relative inline-flex items-center gap-1.5 text-sm font-medium {link.active
					? 'text-foreground'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				{link.label}
				{#if link.caret}<ChevronDown size={14} class="opacity-70" />{/if}
				{#if link.active}
					<span class="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary"></span>
				{/if}
			</a>
		{/each}
	</nav>

	<div class="flex items-center gap-2">
		<button
			type="button"
			class="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
			>Log in</button
		>
		<button
			type="button"
			class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
		>
			Get started <ArrowUpRight size={16} />
		</button>
	</div>
</header>
