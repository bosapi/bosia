<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	const links = [
		{ label: "Home", active: true },
		{ label: "Shop" },
		{ label: "About" },
		{ label: "Contact" },
	];
</script>

<header
	class="absolute inset-x-0 top-0 z-20 flex h-16 w-full items-center justify-between px-6 text-background"
>
	<div class="flex items-center gap-8">
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
					class="relative inline-flex items-center text-sm font-medium {link.active
						? 'text-background'
						: 'text-background/70 hover:text-background'}"
				>
					{link.label}
					{#if link.active}
						<span class="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary"></span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<div class="flex items-center gap-2.5">
		<button
			type="button"
			class="hidden rounded-md px-4 py-2 text-sm font-semibold text-background/80 hover:text-background sm:inline-flex"
			>Sign in</button
		>
		<button
			type="button"
			class="inline-flex items-center gap-2 rounded-md border border-background/30 px-4 py-2 text-sm font-semibold text-background transition hover:bg-background/10"
		>
			Get started <ArrowRight size={16} />
		</button>
	</div>
</header>
