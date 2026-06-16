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
	class="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 text-card-foreground"
>
	<a href="/" class="flex items-center gap-2.5">
		<div
			class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
		>
			B
		</div>
		<span class="font-display text-lg font-extrabold tracking-tight">Brand</span>
	</a>

	<div class="flex items-center gap-7">
		<nav class="hidden items-center gap-7 md:flex">
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
		<button
			type="button"
			class="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
			>Copy code</button
		>
	</div>
</header>
